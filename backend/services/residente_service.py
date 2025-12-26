import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy.orm import Session
from sqlalchemy import desc
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

    def eliminar(self, residente_id: int):
        residente = self.db.query(models.Residente).filter(models.Residente.id == residente_id).first()
        if residente:
            self.db.delete(residente)
            self.db.commit()
            return True
        return False