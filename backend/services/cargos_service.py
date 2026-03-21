from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
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
    
    

def obtener_cargos_por_propiedad(db: Session, propiedad_id: int):
    return db.query(models.Cargo).filter(models.Cargo.propiedad_id == propiedad_id).all()  
    

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
