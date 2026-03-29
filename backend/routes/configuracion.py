from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Importamos la conexión a BD, los esquemas y el servicio
from database import get_db
from schemas import ComunidadUpdate
from services import configuracion_service

router = APIRouter()

@router.put("/api/comunidades/{comunidad_id}")
def actualizar_configuracion_comunidad(comunidad_id: int, datos: ComunidadUpdate, db: Session = Depends(get_db)):
    # Delegamos toda la lógica de guardado al servicio
    comunidad_actualizada = configuracion_service.actualizar_comunidad(db, comunidad_id, datos)
    
    if not comunidad_actualizada:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")
        
    return {"message": "Configuración actualizada correctamente", "data": comunidad_actualizada}
