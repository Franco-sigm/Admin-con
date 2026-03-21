from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
import models
import schemas

def crear_comunidad(db: Session, comunidad: schemas.ComunidadCreate, usuario_id: int):
    # Verificamos nuestro "candado" de la base de datos (nombre + dirección)
    comunidad_existente = db.query(models.Comunidad).filter(
        models.Comunidad.nombre == comunidad.nombre,
        models.Comunidad.direccion == comunidad.direccion
    ).first()

    if comunidad_existente:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe una comunidad con este nombre en esta dirección."
        )

    # Creamos la comunidad asignándole el ID del usuario creador (el Administrador)
    db_comunidad = models.Comunidad(**comunidad.model_dump(), usuario_id=usuario_id)
    
    try:
        db.add(db_comunidad)
        db.commit()
        db.refresh(db_comunidad)
        return db_comunidad
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno al crear la comunidad.")

def obtener_comunidades_por_usuario(db: Session, usuario_id: int):
    # Devuelve solo los edificios que administra este usuario específico
    return db.query(models.Comunidad).filter(models.Comunidad.usuario_id == usuario_id).all()

def obtener_comunidad_por_id(db: Session, comunidad_id: int):
    return db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
