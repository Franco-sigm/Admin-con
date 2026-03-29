from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
import services.propiedad_service as prop_service
import models
import services.propiedad_service as propiedad_service

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
    return prop_service.obtener_propiedades_por_comunidad(
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

@router.put("/{propiedad_id}", response_model=schemas.Propiedad)
def actualizar_propiedad(
    propiedad_id: int, 
    propiedad_in: schemas.PropiedadUpdate, 
    db: Session = Depends(get_db)
):
    db_propiedad = propiedad_service.actualizar_propiedad(db, propiedad_id, propiedad_in)
    if not db_propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return db_propiedad

# En routes/propiedades.py
@router.post("/comunidad/{comunidad_id}/recalcular-prorrateos")
def recalcular(comunidad_id: int, db: Session = Depends(get_db)):
    res = prop_service.recalcular_todos_los_prorrateos(db, comunidad_id)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res



@router.post("/comunidad/{comunidad_id}/superficie-masiva")
def asignar_superficie_masiva(comunidad_id: int, superficie: float, db: Session = Depends(get_db)):
    if superficie <= 0:
        raise HTTPException(status_code=400, detail="La superficie debe ser mayor a 0")
        
    # Actualizamos todas las propiedades de la comunidad en una sola consulta
    db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    ).update({"superficie_m2": superficie})
    
    db.commit()
    
    # Autoguardado masivo: recalculamos tras la asignación
    prop_service.recalcular_todos_los_prorrateos(db, comunidad_id)
    
    return {"mensaje": f"Se asignaron {superficie} m² a todas las unidades."}