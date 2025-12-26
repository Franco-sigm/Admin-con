import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models
import schemas




class TransaccionService:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, datos: schemas.TransaccionCreate):
        nuevo = models.Transaccion(**datos.dict())
        self.db.add(nuevo)
        self.db.commit()
        self.db.refresh(nuevo)
        return nuevo

    def obtener_por_comunidad(self, comunidad_id: int):
        # Ordenamos por fecha descendente (lo más nuevo primero)
        return self.db.query(models.Transaccion)\
            .filter(models.Transaccion.comunidad_id == comunidad_id)\
            .order_by(desc(models.Transaccion.fecha))\
            .all()
            
    def actualizar(self, transaccion_id: int, datos: dict):
        tx = self.db.query(models.Transaccion).filter(models.Transaccion.id == transaccion_id).first()
        if not tx:
            return None
        
        for key, value in datos.items():
            if hasattr(tx, key):
                setattr(tx, key, value)
        
        self.db.commit()
        self.db.refresh(tx)
        return tx
    

    def eliminar(self, transaccion_id: int):
        tx = self.db.query(models.Transaccion).filter(models.Transaccion.id == transaccion_id).first()
        if tx:
            self.db.delete(tx)
            self.db.commit()
            return True
        return False