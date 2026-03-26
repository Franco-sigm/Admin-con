from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services import propiedad_service

# Asumiendo que moveremos la seguridad a security.py como acordamos
from security import obtener_usuario_actual 

router = APIRouter(
    prefix="/api/propiedades",
    tags=["Administración de Propiedades"]
)

@router.post("", response_model=schemas.Propiedad, status_code=201)
def crear_propiedad(
    propiedad: schemas.PropiedadCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Crea una nueva unidad física (Ej: Depto 402) dentro de un condominio.
    """
    return propiedad_service.crear_propiedad(db=db, propiedad=propiedad)

@router.get("/comunidad/{comunidad_id}", response_model=schemas.PropiedadesPaginadas)
def listar_propiedades(
    comunidad_id: int,
    page: int = 1,
    limit: int = 20,
    search: str = None, # <-- Parámetro para la búsqueda global
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    return propiedad_service.obtener_propiedades_por_comunidad(
        db, comunidad_id, skip, limit, search
    )

@router.delete("/{propiedad_id}", status_code=204)
def eliminar_propiedad(
    propiedad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Elimina una propiedad específica por su ID.
    """
    propiedad_service.eliminar_propiedad(db=db, propiedad_id=propiedad_id)  