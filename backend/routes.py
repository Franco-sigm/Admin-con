# backend/routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter()

# --- RUTAS DE COMUNIDADES ---

# GET: Obtener todas las comunidades
# response_model=List[schemas.Comunidad] asegura que devolvemos el formato correcto
@router.get("/comunidades", response_model=List[schemas.Comunidad])
def leer_comunidades(db: Session = Depends(get_db)):
    comunidades = db.query(models.Comunidad).all()
    return comunidades

# POST: Crear una comunidad
@router.post("/comunidades", response_model=schemas.Comunidad)
def crear_comunidad(comunidad: schemas.ComunidadCreate, db: Session = Depends(get_db)):
    # Convertimos el Schema Pydantic a Modelo SQLAlchemy
    db_comunidad = models.Comunidad(nombre=comunidad.nombre, direccion=comunidad.direccion)
    db.add(db_comunidad)
    db.commit()
    db.refresh(db_comunidad)
    return db_comunidad

# --- RUTAS DE ANUNCIOS ---

@router.get("/anuncios/{comunidad_id}", response_model=List[schemas.Anuncio])
def leer_anuncios(comunidad_id: int, db: Session = Depends(get_db)):
    anuncios = db.query(models.Anuncio).filter(models.Anuncio.comunidad_id == comunidad_id).all()
    return anuncios

@router.post("/anuncios", response_model=schemas.Anuncio)
def crear_anuncio(anuncio: schemas.AnuncioCreate, db: Session = Depends(get_db)):
    db_anuncio = models.Anuncio(**anuncio.dict()) # Truco ninja para desempaquetar datos
    db.add(db_anuncio)
    db.commit()
    db.refresh(db_anuncio)
    return db_anuncio