from fastapi import HTTPException  # 👈 Importante para que no falle al eliminar
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from models import Transaccion, Cargo, DetallePago 
import schemas
from datetime import datetime

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
    Trae el historial filtrado por mes/año y paginado para no saturar la red.
    """
    # 1. Empezamos la consulta base
    query = db.query(Transaccion).filter(Transaccion.comunidad_id == comunidad_id)
    
    # 2. Aplicamos filtros de fecha si el usuario los envía
    if mes:
        query = query.filter(extract('month', Transaccion.fecha) == mes)
    if anio:
        query = query.filter(extract('year', Transaccion.fecha) == anio)
        
    # 3. Contamos el total ANTES de paginar (React necesita saber cuántas páginas hay en total)
    total_registros = query.count()
    
    # 4. Ordenamos y cortamos la tajada exacta que pidió React (Paginación)
    transacciones = query.order_by(Transaccion.fecha_creacion.desc()).offset(skip).limit(limit).all()
    
    # Devolvemos un diccionario con la data y el total
    return {
        "total": total_registros,
        "items": transacciones
    }
 
# --- 2. LÓGICA DE REGISTRO ---

def crear_transaccion_general(db: Session, transaccion: schemas.TransaccionCreate):
    """Crea un registro simple de dinero (Útil para Egresos)."""
    nueva_transaccion = Transaccion(
        tipo=transaccion.tipo,
        monto_total=transaccion.monto_total,
        descripcion=transaccion.descripcion,
        metodo_pago=transaccion.metodo_pago,
        fecha=transaccion.fecha or datetime.now(),
        comunidad_id=transaccion.comunidad_id,
        propiedad_id=transaccion.propiedad_id,
        comprobante_url=transaccion.comprobante_url,
        categoria=transaccion.categoria 
    )
    db.add(nueva_transaccion)
    db.commit()
    db.refresh(nueva_transaccion)
    return nueva_transaccion

def registrar_transaccion_y_pagar_cargos(db: Session, transaccion: schemas.TransaccionCreate):
    """Registra un PAGO y descuenta de las deudas (Lógica FIFO con historial)."""
    # 👇 Aquí llamamos a la función de arriba, ¡por eso no podía faltar!
    pago = crear_transaccion_general(db, transaccion)
    
    if transaccion.tipo == 'INGRESO' or getattr(transaccion.tipo, 'value', transaccion.tipo) == 'INGRESO':
        if transaccion.propiedad_id:
            # Buscamos todas las deudas que no estén pagadas al 100%
            cargos_pendientes = db.query(Cargo).filter(
                Cargo.propiedad_id == transaccion.propiedad_id,
                Cargo.estado != schemas.EstadoCargo.PAGADO
            ).order_by(Cargo.fecha_vencimiento.asc()).all()
            
            monto_disponible = pago.monto_total
            
            for cargo in cargos_pendientes:
                if monto_disponible <= 0: break
                
                # 1. Calculamos cuánto se ha pagado históricamente de este cargo puntual
                pagado_historico = db.query(func.sum(DetallePago.monto_abonado)).filter(
                    DetallePago.cargo_id == cargo.id
                ).scalar() or 0
                
                falta_por_pagar = cargo.monto - pagado_historico
                
                # 2. ¿Cuánto dinero de esta transferencia le asignaremos a este cargo?
                abono = min(monto_disponible, falta_por_pagar)
                
                if abono > 0:
                    # 3. LA MAGIA: Imprimimos el recibo en la tabla puente
                    nuevo_detalle = DetallePago(
                        transaccion_id=pago.id,
                        cargo_id=cargo.id,
                        monto_abonado=abono
                    )
                    db.add(nuevo_detalle)
                
                # 4. Actualizamos el estado del cargo y restamos de nuestra "billetera en mano"
                if abono >= falta_por_pagar:
                    cargo.estado = schemas.EstadoCargo.PAGADO
                else:
                    cargo.estado = schemas.EstadoCargo.PARCIAL
                    
                monto_disponible -= abono
                
            db.commit()
            
    return pago

# --- 3. GESTIÓN DE DEUDAS (Cargos) ---

def crear_cargo(db: Session, cargo: schemas.CargoCreate):
    """Crea una nueva deuda (Gasto Común, Multa) para un depto."""
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
    """
    Trae las deudas, pero le envía a React el SALDO PENDIENTE, 
    protegiendo el historial del monto original en la base de datos.
    """
    cargos = db.query(Cargo).filter(
        Cargo.propiedad_id == propiedad_id,
        Cargo.estado != schemas.EstadoCargo.PAGADO
    ).order_by(Cargo.fecha_vencimiento.asc()).all()

    resultados_para_react = []
    
    for cargo in cargos:
        # Sumamos todos los abonos parciales que tenga esta deuda
        pagado = db.query(func.sum(DetallePago.monto_abonado)).filter(
            DetallePago.cargo_id == cargo.id
        ).scalar() or 0
        
        saldo_real = cargo.monto - pagado
        
        # En vez de enviar el objeto crudo, enviamos un diccionario.
        resultados_para_react.append({
            "id": cargo.id,
            "monto": saldo_real, # ¡React recibirá el saldo restante!
            "concepto": cargo.concepto,
            "fecha_emision": cargo.fecha_emision,
            "fecha_vencimiento": cargo.fecha_vencimiento,
            "estado": cargo.estado,
            "propiedad_id": cargo.propiedad_id
        })
        
    return resultados_para_react

# --- 4. RESUMEN FINANCIERO (Para las tarjetas de arriba) ---

def obtener_balance_comunidad(db: Session, comunidad_id: int):
    """Calcula ingresos, egresos y el saldo real en caja."""
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
    """
    Busca una transacción por ID y la elimina. 
    Esto recalculará automáticamente el balance en la siguiente consulta.
    """
    db_transaccion = db.query(Transaccion).filter(Transaccion.id == transaccion_id).first()
    
    if not db_transaccion:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado")
    
    db.delete(db_transaccion)
    db.commit()
    return {"message": "Eliminado con éxito"}