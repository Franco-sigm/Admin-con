from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas

def crear_residente(db: Session, residente: schemas.ResidenteCreate):
    # Verificamos que el email no esté usado por otra persona en el sistema
    if residente.email:
        email_existente = db.query(models.Residente).filter(models.Residente.email == residente.email).first()
        if email_existente:
            raise HTTPException(status_code=400, detail="Este email ya está en uso por otro residente.")

    db_residente = models.Residente(**residente.model_dump())
    
    try:
        db.add(db_residente)
        db.commit()
        db.refresh(db_residente)
        return db_residente
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al crear el residente. Verifica que la propiedad exista.")

def obtener_residentes_por_comunidad(db: Session, comunidad_id: int):
    # Este es un query avanzado (Join). Buscamos a los residentes, 
    # pero cruzando la información con la tabla Propiedades para filtrar por comunidad.
    return db.query(models.Residente).join(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    ).all()