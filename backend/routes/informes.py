from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from security import obtener_usuario_actual
import schemas
from services import informe_service

router = APIRouter(
    prefix="/api/informes",
    tags=["Reportes e Informes"]
)

@router.get("/comunidad/{comunidad_id}/morosos", response_model=List[Dict[str, Any]])
def reporte_morosos(
    comunidad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Protegido
):
    """
    Devuelve la lista de propiedades que tienen deudas pendientes en la comunidad.
    """
    # Podrías agregar una validación extra aquí para confirmar que 'usuario_actual' 
    # es realmente el administrador de esa 'comunidad_id'.
    return informe_service.obtener_morosos_por_comunidad(db=db, comunidad_id=comunidad_id)

@router.get("/comunidad/{comunidad_id}/balance", response_model=Dict[str, Any])
def reporte_balance(
    comunidad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Protegido
):
    """
    Devuelve el estado financiero actual (Ingresos vs Egresos) de la comunidad.
    """
    return informe_service.obtener_balance_comunidad(db=db, comunidad_id=comunidad_id)