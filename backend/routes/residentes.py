from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session


import schemas
from database import get_db
from security import obtener_usuario_actual
from services import residente_service

router = APIRouter(
    prefix="/api/residentes",
    tags=["Administración de Residentes"]
)

# routes/residentes.py

@router.post("", response_model=schemas.Residente)
def crear_residente(
    residente: schemas.ResidenteCreate, 
    db: Session = Depends(get_db),
    # Descomenta esto cuando quieras proteger la creación
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """
    Crea un residente y lo vincula a una unidad. 
    Toda la lógica de 'buscar o crear' vive en el servicio.
    """
    # LLAMADA LIMPIA AL SERVICIO
    return residente_service.registrar_residente_completo(db=db, residente_in=residente)

@router.get("/comunidad/{comunidad_id}", response_model=schemas.ResidentesPaginados)
def listar_residentes(
    comunidad_id: int,
    page: int = 1,
    limit: int = 15,
    search: str = None, # <-- FastAPI lee ?search=... desde aquí
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    return residente_service.obtener_residentes_por_comunidad(
        db, comunidad_id, skip, limit, search
    )

@router.delete("/{residente_id}", status_code=204)
def eliminar_residente_route(
    residente_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """
    Elimina un residente. El servicio se encarga de la lógica de DB.
    """
    return residente_service.eliminar_residente(db=db, residente_id=residente_id)