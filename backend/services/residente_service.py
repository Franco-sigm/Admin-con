from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas

def crear_residente(db: Session, residente: schemas.ResidenteCreate):
    # Verificamos que el email no esté usado por otra persona en el sistema
    if residente.email:
        email_existente = db.query(models.Residente).filter(models.Residente.email == residente.email).first()
        if email_existente:
            raise HTTPException(status_code=400, detail="Este email ya está en uso por otro residente.")

    db_residente = models.Residente(**residente.model_dump())
    
    try:
        db.add(db_residente)
        db.commit()
        db.refresh(db_residente)
        return db_residente
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al crear el residente. Verifica que la propiedad exista.")

def obtener_residentes_por_comunidad(
    db: Session, 
    comunidad_id: int, 
    skip: int = 0, 
    limit: int = 25
):
    # 1. Armamos la consulta base (sin ejecutarla todavía)
    query = db.query(models.Residente).join(
        models.Residente.propiedades
    ).filter(
        models.Propiedad.comunidad_id == comunidad_id
    )
    
    # 2. Contamos cuántos residentes hay en total en la base de datos para esa comunidad
    total_registros = query.count()
    
    # 3. Aplicamos el joinedload, el corte de la página (offset) y el límite, y ahora sí traemos los datos (.all)
    residentes = query.options(
        joinedload(models.Residente.propiedades)
    ).offset(skip).limit(limit).all()

    # 4. Devolvemos el diccionario mágico que Pydantic y React están esperando
    return {
        "total": total_registros,
        "items": residentes
    }

def eliminar_residente(db: Session, residente_id: int):
    """
    Busca un residente por su ID y lo elimina de la base de datos.
    """
    # 1. Buscamos al residente
    db_residente = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    
    # 2. Si no existe, lanzamos un 404 (esto es lo que espera el frontend)
    if not db_residente:
        raise HTTPException(status_code=404, detail="Residente no encontrado")

    try:
        # 3. Lo borramos
        db.delete(db_residente)
        db.commit()
        return {"message": "Residente eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"No se pudo eliminar: {str(e)}")