from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Importaciones locales de tu proyecto Admin-con
import models
import schemas
from database import get_db
from security import obtener_usuario_actual
from services import residente_service

router = APIRouter(
    prefix="/api/residentes",
    tags=["Administración de Residentes"]
)

@router.post("", response_model=schemas.Residente)
def crear_residente(residente: schemas.ResidenteCreate, db: Session = Depends(get_db)):
    
    # 1. Obtenemos o creamos la propiedad (Tu lógica actual)
    propiedad = None
    if residente.propiedad_id:
        propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == residente.propiedad_id).first()
    elif residente.numero_unidad and residente.comunidad_id:
        propiedad = db.query(models.Propiedad).filter(
            models.Propiedad.numero_unidad == residente.numero_unidad,
            models.Propiedad.comunidad_id == residente.comunidad_id
        ).first()
        if not propiedad:
            propiedad = models.Propiedades(
                numero_unidad=residente.numero_unidad,
                prorrateo=residente.prorrateo,
                comunidad_id=residente.comunidad_id
            )
            db.add(propiedad)
            db.commit()
            db.refresh(propiedad)

    if not propiedad:
        raise HTTPException(status_code=400, detail="Error al procesar la propiedad.")

    # 2. Buscamos si el Residente YA EXISTE por su correo
    residente_db = None
    if residente.email:
        residente_db = db.query(models.Residente).filter(models.Residente.email == residente.email).first()

    # 3. Si NO existe, creamos la persona desde cero
    if not residente_db:
        residente_db = models.Residente(
            nombre=residente.nombre,
            email=residente.email,
            telefono=residente.telefono
            # es_propietario=residente.es_propietario
        )
        db.add(residente_db)

    # 4. LA MAGIA: Vinculamos la propiedad al residente (si no estaba ya vinculada)
    if propiedad not in residente_db.propiedades:
        residente_db.propiedades.append(propiedad)

    db.commit()
    db.refresh(residente_db)
    
    return residente_db

@router.get("/comunidad/{comunidad_id}", response_model=List[schemas.Residente])
def listar_residentes_comunidad(
    comunidad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Devuelve la lista de todos los residentes que pertenecen a un condominio específico.
    Hace un cruce automático con las propiedades internamente a través del service.
    """
    return residente_service.obtener_residentes_por_comunidad(db=db, comunidad_id=comunidad_id)

@router.delete("/{residente_id}", status_code=204)
def eliminar_residente_route(
    residente_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """
    Ruta para eliminar un residente de la comunidad.
    """
    return residente_service.eliminar_residente(db=db, residente_id=residente_id)