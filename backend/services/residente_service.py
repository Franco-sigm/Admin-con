from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas
from sqlalchemy import func

def registrar_residente_completo(db: Session, residente_in: schemas.ResidenteCreate):
    try:
        propiedad = None
        
        # 1. Búsqueda o creación de la unidad
        if residente_in.propiedad_id:
            propiedad = db.get(models.Propiedad, residente_in.propiedad_id)
        
        elif residente_in.numero_unidad and residente_in.comunidad_id:
            # Buscamos si la unidad ya existe en esta comunidad específica
            propiedad = db.query(models.Propiedad).filter(
                models.Propiedad.numero_unidad == residente_in.numero_unidad,
                models.Propiedad.comunidad_id == residente_in.comunidad_id
            ).first()
            
            if not propiedad:
                # Si no existe, la creamos (Lógica de "Alta rápida")
                propiedad = models.Propiedad(
                    numero_unidad=residente_in.numero_unidad,
                    comunidad_id=residente_in.comunidad_id,
                    prorrateo=residente_in.prorrateo or 0.0
                )
                db.add(propiedad)
                db.flush() # Flush para tener el ID disponible para la relación

        if not propiedad:
            raise HTTPException(status_code=400, detail="No se pudo determinar la propiedad.")

        # 2. Gestión del residente (Evitar duplicados)
        residente_db = None
        if residente_in.email:
            residente_db = db.query(models.Residente).filter(
                models.Residente.email == residente_in.email
            ).first()
        
        if not residente_db:
            residente_db = models.Residente(
                nombre=residente_in.nombre,
                email=residente_in.email,
                telefono=residente_in.telefono
            )
            db.add(residente_db)
            db.flush()
        else:
            # OPCIONAL: Actualizar el teléfono si el residente ya existía pero cambió
            if residente_in.telefono:
                residente_db.telefono = residente_in.telefono

        # 3. Vinculación Many-to-Many (La clave del control)
        # SQLAlchemy detecta la tabla intermedia 'residente_propiedad' automáticamente
        if propiedad not in residente_db.propiedades:
            residente_db.propiedades.append(propiedad)

        db.commit()
        db.refresh(residente_db)
        return residente_db

    except Exception as e:
        db.rollback()
        # Log técnico para el flujo de trabajo
        print(f" Error en registrar_residente_completo: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    

def obtener_residentes_por_comunidad(db: Session, comunidad_id: int, skip: int = 0, limit: int = 15):
    # 1. Consulta base sobre Propiedad
    query = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    )

    total = query.count()

    # 2. ORDENAMIENTO NATURAL (Soporta números y letras como 101-A)
    # Primero ordena por el largo del texto para que "2" vaya antes que "10"
    # Luego ordena alfabéticamente para que "108-A" vaya antes que "108-B"
    items = query.options(
        joinedload(models.Propiedad.residentes)
    ).order_by(
        func.length(models.Propiedad.numero_unidad).asc(),
        models.Propiedad.numero_unidad.asc()
    ).offset(skip).limit(limit).all()

    return {
        "total": total,
        "items": items
    }

def eliminar_residente(db: Session, residente_id: int):
    """
    Elimina al residente. La tabla intermedia se limpia sola por el CASCADE.
    """
    db_residente = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if db_residente:
        db.delete(db_residente)
        db.commit()
        return True
    return False

