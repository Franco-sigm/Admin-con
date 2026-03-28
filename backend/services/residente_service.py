from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import models
import schemas
from sqlalchemy import func, or_
from typing import List

# En services/residente_service.py

def crear_residente(db: Session, residente_in: schemas.ResidenteCreate):
    try:
        propiedad = None
        
        # 1. Búsqueda o creación de la unidad
        if residente_in.propiedad_id:
            propiedad = db.get(models.Propiedad, residente_in.propiedad_id)
        
        elif residente_in.numero_unidad and residente_in.comunidad_id:
            propiedad = db.query(models.Propiedad).filter(
                models.Propiedad.numero_unidad == residente_in.numero_unidad,
                models.Propiedad.comunidad_id == residente_in.comunidad_id
            ).first()
            
            if not propiedad:
                propiedad = models.Propiedad(
                    numero_unidad=residente_in.numero_unidad,
                    comunidad_id=residente_in.comunidad_id,
                    prorrateo=residente_in.prorrateo or 0.0
                )
                db.add(propiedad)
                db.flush()

        if not propiedad:
            raise HTTPException(status_code=400, detail="No se pudo determinar la propiedad.")

        # --- NUEVA LÓGICA DE SUSTITUCIÓN ---
        # Antes de crear o asignar al nuevo, desactivamos a cualquier residente 
        # que esté actualmente activo en esta propiedad específica.
        db.query(models.Residente).join(models.Residente.propiedades).filter(
            models.Propiedad.id == propiedad.id,
            models.Residente.activo == 1
        ).update({"activo": 0}, synchronize_session=False)
        # -----------------------------------

        # 2. Gestión del residente (Evitar duplicados por email)
        residente_db = None
        if residente_in.email:
            residente_db = db.query(models.Residente).filter(
                models.Residente.email == residente_in.email
            ).first()
        
        if not residente_db:
            residente_db = models.Residente(
                nombre=residente_in.nombre,
                email=residente_in.email,
                telefono=residente_in.telefono,
                activo=1 # Aseguramos que el nuevo entre como activo
            )
            db.add(residente_db)
            db.flush()
        else:
            # Si el residente ya existía en la DB, lo activamos y actualizamos datos
            residente_db.activo = 1 
            if residente_in.telefono:
                residente_db.telefono = residente_in.telefono
            if residente_in.nombre:
                residente_db.nombre = residente_in.nombre

        # 3. Vinculación Many-to-Many
        if propiedad not in residente_db.propiedades:
            residente_db.propiedades.append(propiedad)

        db.commit()
        db.refresh(residente_db)
        return residente_db

    except Exception as e:
        db.rollback()
        print(f" Error en registrar_residente_completo: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")



def obtener_residentes_por_comunidad(db: Session, comunidad_id: int, skip: int = 0, limit: int = 15, search: str = None):
    # 1. Consulta base con carga de relación (Eager Loading)
    query = db.query(models.Propiedad).options(
        joinedload(models.Propiedad.residentes)
    ).filter(
        models.Propiedad.comunidad_id == comunidad_id
    )

    # 2. Búsqueda (si existe)
    if search:
        search_filter = f"%{search}%"
        query = query.join(models.Propiedad.residentes).filter(
            models.Residente.activo == 1,
            or_(
                models.Propiedad.numero_unidad.ilike(search_filter),
                models.Residente.nombre.ilike(search_filter)
            )
        ).distinct()

    # 3. Ordenamiento y Paginación
    total = query.count()
    items = query.order_by(
        func.length(models.Propiedad.numero_unidad).asc(),
        models.Propiedad.numero_unidad.asc()
    ).offset(skip).limit(limit).all()

    # 4. FILTRO DE RESIDENTES (Punto Crítico)
    for prop in items:
    # Este filtro cubre: 1 (tinyint), True (boolean) y NULL (registros antiguos)
        prop.residentes = [
            r for r in prop.residentes 
            if r.activo == 1 or r.activo is True or r.activo is None
    ]

    return {
        "total": total,
        "items": items
    }

def eliminar_residente(db: Session, residente_id: int):
    """
    Desactiva al residente (borrado lógico) en lugar de eliminarlo físicamente.
    Mantiene la integridad de los registros históricos en la comunidad.
    """
    db_residente = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    
    if db_residente:
        # Cambio de estado a inactivo
        db_residente.activo = 0 
        
        try:
            db.commit()
            db.refresh(db_residente)
            return True
        except Exception:
            db.rollback()
            return False
            
    return False

# NUEVO SERVICIO PARA IMPORTACIÓN MASIVA DESDE EXCEL
def importar_residentes_masivo(db: Session, comunidad_id: int, datos: List[schemas.ResidenteImport]):
    resumen = {"creados": 0, "errores": 0}
    
    for item in datos:
        try:
            # Convertimos el item de importación al esquema que ya valida el Service
            residente_in = schemas.ResidenteCreate(
                nombre=item.nombre,
                email=item.email,
                telefono=item.telefono,
                numero_unidad=item.numero_unidad,
                comunidad_id=comunidad_id,
                prorrateo=item.prorrateo
            )
            
            # Reutilizamos la lógica que ya limpia duplicados y vincula
            crear_residente(db, residente_in)
            resumen["creados"] += 1
            
        except Exception as e:
            print(f"Error importando unidad {item.numero_unidad}: {e}")
            resumen["errores"] += 1
            continue # Si una fila falla, seguimos con la siguiente
            
    return resumen