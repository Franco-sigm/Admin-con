from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas
from sqlalchemy import func, or_

def crear_propiedad(db: Session, propiedad: schemas.PropiedadCreate):
    # Verificamos si ya existe el "Depto 402" en esta comunidad específica
    propiedad_existente = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == propiedad.comunidad_id,
        models.Propiedad.numero_unidad == propiedad.numero_unidad
    ).first()

    if propiedad_existente:
        raise HTTPException(status_code=400, detail="Esta unidad ya está registrada en la comunidad.")

    # Pydantic v2 usa model_dump() en lugar del antiguo .dict()
    db_propiedad = models.Propiedad(**propiedad.model_dump())
    
    try:
        db.add(db_propiedad)
        db.commit()
        db.refresh(db_propiedad)
        return db_propiedad
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en la base de datos.")

def obtener_propiedades_por_comunidad(db: Session, comunidad_id: int, skip: int = 0, limit: int = 20, search: str = None):
    # 1. Consulta base
    query = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    )

    # 2. Aplicar filtro de búsqueda si existe
    if search:
        query = query.filter(
            models.Propiedad.numero_unidad.ilike(f"%{search}%")
        )

    total = query.count()
    
    # 3. Ordenamiento natural (por largo y luego texto)
    propiedades = query.order_by(
        func.length(models.Propiedad.numero_unidad).asc(),
        models.Propiedad.numero_unidad.asc()
    ).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": propiedades
    }

def eliminar_propiedad(db: Session, propiedad_id: int):
    propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == propiedad_id).first()
    
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    
    try:
        db.delete(propiedad)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar esta propiedad porque tiene residentes o deudas asociadas.")
    


def actualizar_propiedad(db: Session, propiedad_id: int, propiedad_in: schemas.PropiedadUpdate):
    db_propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == propiedad_id).first()
    if db_propiedad:
        # Actualizamos solo los campos enviados
        update_data = propiedad_in.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_propiedad, key, value)
        
        db.commit()
        db.refresh(db_propiedad)
    return db_propiedad