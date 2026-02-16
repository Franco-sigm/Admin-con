from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import func
import models
import schemas

# ==========================================
# 1. EMITIR UN COBRO (Deuda)
# ==========================================
def crear_cargo(db: Session, cargo: schemas.CargoCreate):
    # Validamos que no le estemos cobrando a un departamento que no existe
    propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == cargo.propiedad_id).first()
    if not propiedad:
        raise HTTPException(status_code=404, detail="La propiedad indicada no existe.")

    db_cargo = models.Cargo(**cargo.model_dump())
    db.add(db_cargo)
    db.commit()
    db.refresh(db_cargo)
    return db_cargo

# ==========================================
# 2. REGISTRAR PAGO Y REPARTIR EL DINERO (La Magia)
# ==========================================
def registrar_transaccion_y_pagar_cargos(db: Session, transaccion: schemas.TransaccionCreate):
    
    # 1. Creamos la Transacción real (el dinero que entró al banco)
    db_transaccion = models.Transaccion(**transaccion.model_dump())
    db.add(db_transaccion)
    
    # flush() es un truco avanzado: "simula" que lo guarda en la BD para que MySQL le asigne 
    # un ID (db_transaccion.id), pero NO hace el commit definitivo todavía por si hay un error más adelante.
    db.flush() 

    # 2. Si es un EGRESO (ej. pagarle al jardinero), no hay deudas que saldar. 
    # Guardamos y terminamos.
    if transaccion.tipo == schemas.TipoTransaccion.EGRESO:
        db.commit()
        db.refresh(db_transaccion)
        return db_transaccion

    # 3. Si es INGRESO, verificamos que venga de una propiedad válida
    if not transaccion.propiedad_id:
        db.rollback()
        raise HTTPException(status_code=400, detail="Un INGRESO debe estar asociado a una propiedad para saldar deudas.")

    # 4. Buscar TODAS las deudas pendientes de esta propiedad, ordenadas de la MÁS VIEJA a la más nueva
    cargos_pendientes = db.query(models.Cargo).filter(
        models.Cargo.propiedad_id == transaccion.propiedad_id,
        models.Cargo.estado.in_([schemas.EstadoCargo.PENDIENTE, schemas.EstadoCargo.PARCIAL])
    ).order_by(models.Cargo.fecha_vencimiento.asc()).all()

    # Esta es nuestra "billetera virtual" con el dinero que acaba de transferir el residente
    monto_disponible = transaccion.monto_total

    # 5. REPARTIR EL DINERO (Lógica FIFO - First In, First Out)
    for cargo in cargos_pendientes:
        if monto_disponible <= 0:
            break # Ya se nos acabó el dinero de la transferencia, paramos el ciclo.

        # Calcular cuánto se debe EXACTAMENTE de este cargo (Monto original menos abonos previos)
        abonos_previos = db.query(func.sum(models.DetallePago.monto_abonado)).filter(
            models.DetallePago.cargo_id == cargo.id
        ).scalar() or 0
        
        deuda_actual_cargo = cargo.monto - abonos_previos

        # Determinar cuánto dinero de la transferencia usaremos para esta deuda
        # (Usamos todo lo que pide, a menos que nos quede menos plata disponible)
        monto_a_abonar = min(monto_disponible, deuda_actual_cargo)

        # 6. Crear el puente (La tabla DetallePago que vincula la Transacción con el Cargo)
        nuevo_detalle = models.DetallePago(
            transaccion_id=db_transaccion.id,
            cargo_id=cargo.id,
            monto_abonado=monto_a_abonar
        )
        db.add(nuevo_detalle)

        # 7. Actualizar el estado de la boleta/cargo
        if monto_a_abonar == deuda_actual_cargo:
            cargo.estado = schemas.EstadoCargo.PAGADO
        else:
            cargo.estado = schemas.EstadoCargo.PARCIAL

        # 8. Descontamos la plata usada de nuestra billetera virtual
        monto_disponible -= monto_a_abonar

    # Nota: Si sobró dinero (monto_disponible > 0), el residente pagó de más. 
    # La transacción queda registrada por el total real, pero los detalles cubren hasta donde hubo deuda.

    # 9. GUARDAR TODO JUNTO (Transaccionalidad)
    # Si el código llegó hasta aquí sin errores, guardamos la transacción, 
    # los abonos y los cambios de estado al mismo tiempo. Si el servidor se apaga a la mitad, 
    # no se guarda nada (evitando que la plata se pierda o las deudas queden mal).
    try:
        db.commit()
        db.refresh(db_transaccion)
        return db_transaccion
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno al procesar el pago.")