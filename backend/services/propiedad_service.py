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


def recalcular_todos_los_prorrateos(db: Session, comunidad_id: int):
    # 1. Obtener la comunidad
    comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    
    if not comunidad:
        return {"error": "Comunidad no encontrada."}

    # 2. Obtener todas las unidades
    propiedades = db.query(models.Propiedad).filter(models.Propiedad.comunidad_id == comunidad_id).all()

    # 3. Calcular la superficie total automáticamente sumando todas las unidades
    superficie_total_calculada = sum((p.superficie_m2 or 0) for p in propiedades)
    
    if superficie_total_calculada <= 0:
        return {"error": "Las unidades no tienen superficie asignada para poder calcular el prorrateo."}

    # Actualizamos la comunidad con el valor real sumado
    comunidad.superficie_total_m2 = superficie_total_calculada

    for p in propiedades:
        if p.superficie_m2 and p.superficie_m2 > 0:
            # Cálculo exacto asegurando que el total de la comunidad sea 100%
            p.prorrateo = p.superficie_m2 / superficie_total_calculada
        else:
            p.prorrateo = 0.0

    db.commit()
    return {"mensaje": f"Prorrateos calculados usando una superficie total de {superficie_total_calculada} m² para {len(propiedades)} unidades."}

def asignar_superficie_masiva(db: Session, comunidad_id: int, superficie: float):
    if superficie <= 0:
        raise HTTPException(status_code=400, detail="La superficie debe ser mayor a 0")
        
    # update() devuelve automáticamente el número de filas que coinciden y se actualizan
    filas_actualizadas = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    ).update({"superficie_m2": superficie}, synchronize_session=False)
    
    db.commit()
    return {"mensaje": f"Se asignaron {superficie} m² a {filas_actualizadas} unidades de la comunidad."}