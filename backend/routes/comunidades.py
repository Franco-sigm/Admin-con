from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services import comunidad_service

# Importamos tu función de seguridad (asumiendo que la pondremos en security.py)
from security import obtener_usuario_actual 

router = APIRouter(
    prefix="/api/comunidades",
    tags=["Administración de Comunidades"]
)

@router.post("/", response_model=schemas.Comunidad, status_code=201)
def crear_comunidad(
    comunidad: schemas.ComunidadCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Crea un nuevo condominio. 
    Automáticamente se le asigna al usuario que está enviando el token.
    """
    return comunidad_service.crear_comunidad(
        db=db, 
        comunidad=comunidad, 
        usuario_id=usuario_actual.id # Sacamos el ID directamente del token
    )

@router.get("/", response_model=List[schemas.Comunidad])
def listar_mis_comunidades(
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Devuelve SOLO las comunidades que administra el usuario logueado.
    """
    return comunidad_service.obtener_comunidades_por_usuario(db=db, usuario_id=usuario_actual.id)