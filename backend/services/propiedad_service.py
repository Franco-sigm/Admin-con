from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas

def crear_propiedad(db: Session, propiedad: schemas.PropiedadCreate):
    # Verificamos si ya existe el "Depto 402" en esta comunidad específica
    propiedad_existente = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == propiedad.comunidad_id,
        models.Propiedad.numero_unidad == propiedad.numero_unidad
    ).first()

    if propiedad_existente:
        raise HTTPException(status_code=400, detail="Esta unidad ya está registrada en la comunidad.")

    # Pydantic v2 usa model_dump() en lugar del antiguo .dict()
    db_propiedad = models.Propiedad(**propiedad.model_dump())
    
    try:
        db.add(db_propiedad)
        db.commit()
        db.refresh(db_propiedad)
        return db_propiedad
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.")

def obtener_propiedades_por_comunidad(db: Session, comunidad_id: int):
    # Retorna todas las propiedades de un edificio para mostrarlas en el frontend
    return db.query(models.Propiedad).filter(models.Propiedad.comunidad_id == comunidad_id).all()