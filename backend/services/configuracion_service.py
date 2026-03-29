from sqlalchemy.orm import Session
from models import Comunidad
from schemas import ComunidadUpdate

def actualizar_comunidad(db: Session, comunidad_id: int, datos: ComunidadUpdate):
    # 1. Buscar el registro existente en la base de datos
    comunidad = db.query(Comunidad).filter(Comunidad.id == comunidad_id).first()
    
    if not comunidad:
        return None
        
    # 2. Actualizar solo los campos que el frontend nos haya enviado
    # exclude_unset=True ignora los campos que el frontend no incluyó en la petición
    datos_dict = datos.dict(exclude_unset=True)
    for key, value in datos_dict.items():
        setattr(comunidad, key, value)
        
    # 3. Guardar los cambios definitivamente
    db.commit()
    db.refresh(comunidad)
    return comunidad
