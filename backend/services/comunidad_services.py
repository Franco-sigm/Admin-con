# backend/services/comunidad_service.py
from sqlalchemy.orm import Session
import models, schemas

class ComunidadService:
    def __init__(self, db: Session):
        self.db = db

    # Método para obtener todas
    def obtener_todas(self):
        return self.db.query(models.Comunidad).all()

    # Método para crear una nueva
    def crear_comunidad(self, datos: schemas.ComunidadCreate):
        # Transformamos el Schema (JSON) a Modelo (Tabla)
        nueva_comunidad = models.Comunidad(
            nombre=datos.nombre,
            direccion=datos.direccion
        )
        self.db.add(nueva_comunidad)
        self.db.commit()
        self.db.refresh(nueva_comunidad)
        return nueva_comunidad