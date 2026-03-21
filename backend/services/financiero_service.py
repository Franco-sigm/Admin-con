from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from models import Transaccion, Cargo, DetallePago 
import schemas

# --- 1. CONSULTAS DE LISTADO (Para que React dibuje la tabla) ---

def obtener_transacciones_comunidad(
    db: Session, 
    comunidad_id: int, 
    mes: int = None, 
    anio: int = None, 
    skip: int = 0, 
    limit: int = 20
):
    """
    Trae el historial filtrado por mes/año y paginado.
    """
    query = db.query(Transaccion).filter(Transaccion.comunidad_id == comunidad_id)
    
    if mes:
        query = query.filter(extract('month', Transaccion.fecha) == mes)
    if anio:
        query = query.filter(extract('year', Transaccion.fecha) == anio)
        
    total_registros = query.count()
    
    transacciones = query.order_by(Transaccion.fecha_creacion.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total_registros,
        "items": transacciones
    }

def crear_transaccion_general(
    db: Session, 
    comunidad_id: int, 
    tipo: str, 
    monto_total: float, # Cambiado a float por precisión financiera
    metodo_pago: str, 
    descripcion: str, 
    categoria: str, 
    fecha: str = None,
    propiedad_id: int = None, 
    comprobante_url: str = None
):
    """
    Crea un registro de transacción básico en la base de datos.
    Si no se proporciona fecha, utiliza la fecha actual del sistema.
    """
    
    # Si la fecha no viene del frontend, generamos la fecha actual en formato ISO (YYYY-MM-DD)
    fecha_final = fecha if fecha else datetime.now().date().isoformat()

    nueva_t = Transaccion(
        comunidad_id=comunidad_id,
        tipo=tipo,
        monto_total=monto_total,
        metodo_pago=metodo_pago,
        descripcion=descripcion,
        categoria=categoria,
        fecha=fecha_final, # Asignamos la fecha procesada
        propiedad_id=propiedad_id,
        comprobante_url=comprobante_url
    )
    
    try:
        db.add(nueva_t)
        db.commit()
        db.refresh(nueva_t)
        return nueva_t
    except Exception as e:
        db.rollback()
        print(f"Error en base de datos: {e}")
        raise e

def registrar_transaccion_y_pagar_cargos(db: Session, transaccion: schemas.TransaccionCreate):
    """
    Registra un PAGO y aplica lógica FIFO para saldar deudas pendientes.
    """
    # 1. Creamos el movimiento general (Llamada corregida con parámetros sueltos)
    pago = crear_transaccion_general(
        db=db,
        comunidad_id=transaccion.comunidad_id,
        tipo=transaccion.tipo,
        monto_total=transaccion.monto_total,
        metodo_pago=transaccion.metodo_pago,
        descripcion=transaccion.descripcion,
        categoria=transaccion.categoria,
        fecha=transaccion.fecha,
        propiedad_id=transaccion.propiedad_id,
        comprobante_url=None # Los pagos rápidos por ahora no llevan archivo aquí
    )
    
    # 2. Si es un ingreso a una propiedad, saldamos deudas (FIFO)
    if (getattr(transaccion.tipo, 'value', transaccion.tipo)) == 'INGRESO':
        if transaccion.propiedad_id:
            cargos_pendientes = db.query(Cargo).filter(
                Cargo.propiedad_id == transaccion.propiedad_id,
                Cargo.estado != schemas.EstadoCargo.PAGADO
            ).order_by(Cargo.fecha_vencimiento.asc()).all()
            
            monto_disponible = pago.monto_total
            
            for cargo in cargos_pendientes:
                if monto_disponible <= 0:
                    break
                
                # Calculamos cuánto falta para completar este cargo
                pagado_historico = db.query(func.sum(DetallePago.monto_abonado)).filter(
                    DetallePago.cargo_id == cargo.id
                ).scalar() or 0
                
                falta_por_pagar = cargo.monto - pagado_historico
                abono = min(monto_disponible, falta_por_pagar)
                
                if abono > 0:
                    # Registramos el detalle del abono
                    nuevo_detalle = DetallePago(
                        transaccion_id=pago.id,
                        cargo_id=cargo.id,
                        monto_abonado=abono
                    )
                    db.add(nuevo_detalle)
                    
                    # Actualizamos estado del cargo
                    if abono >= falta_por_pagar:
                        cargo.estado = schemas.EstadoCargo.PAGADO
                    else:
                        cargo.estado = schemas.EstadoCargo.PARCIAL
                        
                    monto_disponible -= abono
            
            db.commit()
            
    return pago

# --- 3. GESTIÓN DE DEUDAS (Cargos) ---

def crear_cargo(db: Session, cargo: schemas.CargoCreate):
    """Emite una nueva deuda a una propiedad."""
    nuevo_cargo = Cargo(
        monto=cargo.monto,
        concepto=cargo.concepto,
        fecha_emision=cargo.fecha_emision or datetime.now(),
        fecha_vencimiento=cargo.fecha_vencimiento,
        estado=schemas.EstadoCargo.PENDIENTE,
        propiedad_id=cargo.propiedad_id
    )
    db.add(nuevo_cargo)
    db.commit()
    db.refresh(nuevo_cargo)
    return nuevo_cargo

def obtener_cargos_pendientes_por_propiedad(db: Session, propiedad_id: int):
    """Obtiene deudas enviando el saldo real restante a React."""
    cargos = db.query(Cargo).filter(
        Cargo.propiedad_id == propiedad_id,
        Cargo.estado != schemas.EstadoCargo.PAGADO
    ).order_by(Cargo.fecha_vencimiento.asc()).all()

    resultados = []
    for cargo in cargos:
        pagado = db.query(func.sum(DetallePago.monto_abonado)).filter(
            DetallePago.cargo_id == cargo.id
        ).scalar() or 0
        
        resultados.append({
            "id": cargo.id,
            "monto": cargo.monto - pagado,
            "concepto": cargo.concepto,
            "fecha_emision": cargo.fecha_emision,
            "fecha_vencimiento": cargo.fecha_vencimiento,
            "estado": cargo.estado,
            "propiedad_id": cargo.propiedad_id
        })
    return resultados

# --- 4. BALANCE Y ELIMINACIÓN ---

def obtener_balance_comunidad(db: Session, comunidad_id: int):
    """Calcula totales globales de la comunidad."""
    ingresos = db.query(func.sum(Transaccion.monto_total)).filter(
        Transaccion.comunidad_id == comunidad_id,
        Transaccion.tipo == 'INGRESO'
    ).scalar() or 0

    egresos = db.query(func.sum(Transaccion.monto_total)).filter(
        Transaccion.comunidad_id == comunidad_id,
        Transaccion.tipo == 'EGRESO'
    ).scalar() or 0

    return {
        "ingresos": ingresos,
        "egresos": egresos,
        "balance_actual": ingresos - egresos
    }

def eliminar_transaccion(db: Session, transaccion_id: int):
    """Elimina una transacción y libera el saldo."""
    db_transaccion = db.query(Transaccion).filter(Transaccion.id == transaccion_id).first()
    if not db_transaccion:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    
    db.delete(db_transaccion)
    db.commit()
    return {"message": "Eliminado con éxito"}