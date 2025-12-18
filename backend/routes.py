from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# 1. Importamos la conexión a la DB archivos de estructura
from database import get_db
import models
import schemas

# 2.  Router (El mapa de rutas)
router = APIRouter()

# ==========================================
#  COMUNIDADES
# ==========================================

@router.post("/comunidades", response_model=schemas.Comunidad)
def create_comunidad(comunidad: schemas.ComunidadCreate, db: Session = Depends(get_db)):
    # Convertimos el Schema (JSON) a Modelo (DB)
    nueva_comunidad = models.Comunidad(**comunidad.dict())
    
    db.add(nueva_comunidad)
    db.commit()
    db.refresh(nueva_comunidad)
    return nueva_comunidad

@router.get("/comunidades", response_model=List[schemas.Comunidad])
def read_comunidades(db: Session = Depends(get_db)):
    return db.query(models.Comunidad).all()

# actualizar comunidadij
@router.put("/comunidades/{comunidad_id}", response_model=schemas.Comunidad)
def update_comunidad(comunidad_id: int, comunidad: schemas.ComunidadCreate, db: Session = Depends(get_db)):
    # Buscamos la comunidad por ID
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    # Actualizamos los campos con los nuevos datos
    for key, value in comunidad.dict().items():
        setattr(db_comunidad, key, value)

    db.commit()
    db.refresh(db_comunidad)
    return db_comunidad

#borrar comunidad
@router.delete("/comunidades/{comunidad_id}")
def delete_comunidad(comunidad_id: int, db: Session = Depends(get_db)):
    # Buscamos la comunidad
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    # La borramos
    db.delete(db_comunidad)
    db.commit()
    
    return {"message": "Comunidad eliminada correctamente"}

# ==========================================
#  RESIDENTES
# ==========================================

@router.post("/residentes", response_model=schemas.Residente)
def create_residente(residente: schemas.ResidenteCreate, db: Session = Depends(get_db)):
    # VALIDACIÓN: Verificar que la comunidad existe antes de guardar al residente
    comunidad_existe = db.query(models.Comunidad).filter(models.Comunidad.id == residente.comunidad_id).first()
    
    if not comunidad_existe:
        raise HTTPException(status_code=404, detail="La comunidad especificada no existe")

    # Si pasa la validación, guardamos
    nuevo_residente = models.Residente(**residente.dict())
    db.add(nuevo_residente)
    db.commit()
    db.refresh(nuevo_residente)
    return nuevo_residente

@router.get("/residentes", response_model=List[schemas.Residente])
def read_residentes(db: Session = Depends(get_db)):
    return db.query(models.Residente).all()
@router.get("/comunidades/{comunidad_id}", response_model=schemas.Comunidad)
def read_comunidad(comunidad_id: int, db: Session = Depends(get_db)):
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")
    return db_comunidad


# ==========================================
# Transacciones (Gastos / Ingresos)
# ==========================================

@router.post("/transacciones", response_model=schemas.Transaccion)
def create_transaccion(transaccion: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    # Validación de comunidad
    if not db.query(models.Comunidad).filter(models.Comunidad.id == transaccion.comunidad_id).first():
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    nueva_transaccion = models.Transaccion(**transaccion.dict())
    db.add(nueva_transaccion)
    db.commit()
    db.refresh(nueva_transaccion)
    return nueva_transaccion

@router.get("/transacciones", response_model=List[schemas.Transaccion])
def read_transacciones(db: Session = Depends(get_db)):
    return db.query(models.Transaccion).all()


# anunicos 

@router.post("/anuncios", response_model=schemas.Anuncio)
def create_anuncio(anuncio: schemas.AnuncioCreate, db: Session = Depends(get_db)):
    # Validación de comunidad
    if not db.query(models.Comunidad).filter(models.Comunidad.id == anuncio.comunidad_id).first():
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    nuevo_anuncio = models.Anuncio(**anuncio.dict())
    db.add(nuevo_anuncio)
    db.commit()
    db.refresh(nuevo_anuncio)
    return nuevo_anuncio

@router.get("/anuncios", response_model=List[schemas.Anuncio])
def read_anuncios(db: Session = Depends(get_db)):
    return db.query(models.Anuncio).all()