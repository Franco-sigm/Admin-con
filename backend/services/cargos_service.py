from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from fastapi import HTTPException
import models
import schemas

def crear_cargo(db: Session, cargo: schemas.CargoCreate):
    # Verificamos si la propiedad existe
    propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == cargo.propiedad_id).first()
    if not propiedad:
        raise HTTPException(status_code=404, detail="La propiedad no existe")
    
    # Pydantic v2 usa model_dump() en lugar del antiguo .dict()
    db_cargo = models.Cargo(**cargo.model_dump())
    
    try:
        db.add(db_cargo)
        db.commit()
        db.refresh(db_cargo)
        return db_cargo
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.")
    
    

def obtener_cargos_con_saldos_db(db: Session, propiedad_id: int):
    # Buscamos cargos que no estén ANULADOS
    cargos = db.query(models.Cargo).filter(
        models.Cargo.propiedad_id == propiedad_id,
        models.Cargo.estado != 'ANULADO'
    ).order_by(models.Cargo.fecha_vencimiento.asc()).all()
    
    resultados = []
    for cargo in cargos:
        # Sumamos abonos
        pagado = db.query(func.sum(models.DetallePago.monto_abonado)).filter(
            models.DetallePago.cargo_id == cargo.id
        ).scalar() or 0
        
        saldo_real = float(cargo.monto) - float(pagado)
        
        # Corrección de estado
        if saldo_real <= 0 and cargo.estado != 'PAGADO':
            cargo.estado = 'PAGADO'
            db.commit()

        resultados.append({
            "id": cargo.id,
            "monto": cargo.monto,
            "saldo": saldo_real,
            "concepto": cargo.concepto,
            "fecha_emision": cargo.fecha_emision,
            "fecha_vencimiento": cargo.fecha_vencimiento,
            "estado": cargo.estado,
            "propiedad_id": cargo.propiedad_id,
            "pagado": pagado
        })
    return resultados

def eliminar_cargo(db: Session, cargo_id: int):
    cargo = db.query(models.Cargo).filter(models.Cargo.id == cargo_id).first()
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    
    if cargo.estado != 'PENDIENTE':
        raise HTTPException(status_code=400, detail="No se puede eliminar un cargo que ya tiene pagos")
    
    try:
        db.delete(cargo)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar este cargo porque tiene pagos asociados.") 
