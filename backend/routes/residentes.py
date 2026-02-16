from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services import residente_service
from security import obtener_usuario_actual

router = APIRouter(
    prefix="/api/residentes",
    tags=["Administración de Residentes"]
)

@router.post("/", response_model=schemas.Residente, status_code=201)
def registrar_residente(
    residente: schemas.ResidenteCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Registra a una persona y la asocia a una propiedad existente (mediante propiedad_id).
    """
    return residente_service.crear_residente(db=db, residente=residente)

@router.get("/comunidad/{comunidad_id}", response_model=List[schemas.Residente])
def listar_residentes_comunidad(
    comunidad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Devuelve la lista de todos los residentes que pertenecen a un condominio específico.
    Hace un cruce automático con las propiedades internamente.
    """
    return residente_service.obtener_residentes_por_comunidad(db=db, comunidad_id=comunidad_id)