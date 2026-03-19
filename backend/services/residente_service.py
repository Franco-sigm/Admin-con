import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session

import models
import schemas

class ResidenteService:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, datos: schemas.ResidenteCreate):
        # Nota: La validación de que la comunidad exista se hace antes o aquí
        residente_dict = datos.dict()
        nuevo = models.Residente(**residente_dict)
        self.db.add(nuevo)
        self.db.commit()
        self.db.refresh(nuevo)
        return nuevo
 
    def obtener_por_comunidad(self, comunidad_id: int):
        return self.db.query(models.Residente).filter(models.Residente.comunidad_id == comunidad_id).all()

  
    def obtener_por_id(self, residente_id: int):
        return self.db.query(models.Residente).filter(models.Residente.id == residente_id).first()

    def eliminar(self, residente_id: int):
        residente = self.db.query(models.Residente).filter(models.Residente.id == residente_id).first()
        if residente:
            self.db.delete(residente)
            self.db.commit()
            return True
        return False
    
    def actualizar(self, residente_id: int, datos: schemas.ResidenteUpdate):
        residente = self.db.query(models.Residente).filter(models.Residente.id == residente_id).first()
        if residente:
            # exclude_unset=True es perfecto para actualizaciones parciales (PATCH/PUT)
            for key, value in datos.dict(exclude_unset=True).items():
                setattr(residente, key, value)
            self.db.commit()
            self.db.refresh(residente)
            return residente
        return None