# backend/services/financiero_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
import models  # <--- Usaremos este como base
import schemas

# --- 1. CONSULTAS DE LISTADO ---

def obtener_transacciones_comunidad(db: Session, comunidad_id: int, mes: int = None, anio: int = None, skip: int = 0, limit: int = 20):
    query = db.query(models.Transaccion).filter(models.Transaccion.comunidad_id == comunidad_id)
    
    if mes:
        query = query.filter(extract('month', models.Transaccion.fecha) == mes)
    if anio:
        query = query.filter(extract('year', models.Transaccion.fecha) == anio)
        
    total_registros = query.count()
    transacciones = query.order_by(models.Transaccion.fecha_creacion.desc()).offset(skip).limit(limit).all()
    
    return {"total": total_registros, "items": transacciones}

def crear_transaccion_general(db: Session, comunidad_id: int, tipo: str, monto_total: float, metodo_pago: str, descripcion: str, categoria: str, fecha: str = None, propiedad_id: int = None, comprobante_url: str = None):
    fecha_final = fecha if fecha else datetime.now().date().isoformat()
    nueva_t = models.Transaccion( # <--- Agregado models.
        comunidad_id=comunidad_id, tipo=tipo, monto_total=monto_total,
        metodo_pago=metodo_pago, descripcion=descripcion, categoria=categoria,
        fecha=fecha_final, propiedad_id=propiedad_id, comprobante_url=comprobante_url
    )
    try:
        db.add(nueva_t) 
        db.flush() 
        return nueva_t
    except Exception as e:
        print(f"Error al preparar transacción: {e}")
        raise e


def registrar_transaccion_y_pagar_cargos(
    db: Session, 
    tipo: str, 
    monto_total: float, 
    metodo_pago: str, 
    descripcion: str, 
    categoria: str, 
    comunidad_id: int, 
    fecha: str, 
    propiedad_id: int = None, 
    comprobante_url: str = None
):
    """
    Registra un PAGO y aplica lógica FIFO para saldar deudas pendientes.
    Acepta datos directos de Form/Multipart.
    """
    try:
        print(f"--- INICIANDO REGISTRO DE {tipo} ---")
        
        # 1. Creamos el movimiento general llamando a la función auxiliar
        # Aquí pasamos los valores, NO las definiciones de tipo
        pago = crear_transaccion_general(
            db=db,
            comunidad_id=comunidad_id,
            tipo=tipo,
            monto_total=monto_total,
            metodo_pago=metodo_pago,
            descripcion=descripcion,
            categoria=categoria,
            fecha=fecha,
            propiedad_id=propiedad_id,
            comprobante_url=comprobante_url
        )
        
        # Aseguramos que el objeto tenga ID antes de seguir
        db.flush() 
        print(f"DEBUG: Transacción preparada con ID temporal: {pago.id}")

        # Normalizamos para la comparación
        tipo_str = str(tipo).upper()

        # 2. Lógica de Descuento de Deudas
        if tipo_str == 'INGRESO' and propiedad_id:
            print(f"DEBUG: Procesando abonos para propiedad {propiedad_id}")
            
            cargos_pendientes = db.query(models.Cargo).filter(
                models.Cargo.propiedad_id == propiedad_id,
                models.Cargo.estado.in_(['PENDIENTE', 'PARCIAL'])
            ).order_by(models.Cargo.fecha_vencimiento.asc()).all()
            
            monto_disponible = float(monto_total)
            
            for cargo in cargos_pendientes:
                if monto_disponible <= 0: 
                    break
                
                # Calculamos cuánto se ha pagado de este cargo sumando DetallePago
                pagado_actual = db.query(func.sum(models.DetallePago.monto_abonado)).filter(
                    models.DetallePago.cargo_id == cargo.id
                ).scalar() or 0
                
                falta_por_pagar = float(cargo.monto) - float(pagado_actual)
                
                if falta_por_pagar <= 0: 
                    continue 
                
                abono = min(monto_disponible, falta_por_pagar)
                
                if abono > 0:
                    nuevo_detalle = models.DetallePago(
                        transaccion_id=pago.id,
                        cargo_id=cargo.id,
                        monto_abonado=int(abono)
                    )
                    db.add(nuevo_detalle)
                    
                    # Actualizamos estado del cargo
                    cargo.estado = 'PAGADO' if abono >= falta_por_pagar else 'PARCIAL'
                    monto_disponible -= abono
                    print(f"DEBUG: Abonados {abono} al cargo {cargo.id}. Nuevo estado: {cargo.estado}")

        # 3. GUARDADO FÍSICO
        print("DEBUG: Ejecutando db.commit()...")
        db.commit()
        
        db.refresh(pago)
        print(f"✅ ÉXITO: Transacción {pago.id} guardada permanentemente.")
        
        return pago

    except Exception as e:
        db.rollback()
        print(f"❌ FALLO CRÍTICO EN EL PROCESO: {str(e)}")
        raise e
# --- 4. BALANCE Y ELIMINACIÓN ---

def obtener_balance_comunidad(db: Session, comunidad_id: int):
    ingresos = db.query(func.sum(models.Transaccion.monto_total)).filter( # <--- Agregado models.
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == 'INGRESO'
    ).scalar() or 0

    egresos = db.query(func.sum(models.Transaccion.monto_total)).filter( # <--- Agregado models.
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == 'EGRESO'
    ).scalar() or 0

    cargos_pendientes = db.query(models.Cargo).filter( # <--- Agregado models.
        models.Cargo.propiedad_id.in_(
            db.query(models.Propiedad.id).filter(models.Propiedad.comunidad_id == comunidad_id)
        ),
        models.Cargo.estado.in_(['PENDIENTE', 'PARCIAL'])
    ).all()

    monto_total_deuda = sum(c.monto for c in cargos_pendientes)
    ids_cargos = [c.id for c in cargos_pendientes]
    total_abonado = 0
    if ids_cargos:
        total_abonado = db.query(func.sum(models.DetallePago.monto_abonado)).filter( # <--- Agregado models.
            models.DetallePago.cargo_id.in_(ids_cargos)
        ).scalar() or 0

    return {
        "ingresos": ingresos,
        "egresos": egresos,
        "balance_actual": ingresos - egresos,
        "por_cobrar": float(monto_total_deuda) - float(total_abonado)
    }