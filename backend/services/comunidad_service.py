# backend/services/comunidad_service.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models
import schemas


class ComunidadService:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, datos: schemas.ComunidadCreate, usuario_id: int):
        # Usamos model_dump() si es Pydantic v2, o dict() si es v1.
        
        comunidad_dict = datos.dict() 
        nueva = models.Comunidad(**comunidad_dict, usuario_id=usuario_id)
        
        self.db.add(nueva)
        self.db.commit()
        self.db.refresh(nueva)
        return nueva

    def obtener_por_usuario(self, usuario_id: int):
        """Devuelve solo las comunidades creadas por este usuario"""
        return self.db.query(models.Comunidad).filter(models.Comunidad.usuario_id == usuario_id).all()

    def obtener_por_id(self, comunidad_id: int):
        """Busca una comunidad por ID (útil para validar existencias)"""
        return self.db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()

    def validar_propiedad(self, comunidad_id: int, usuario_id: int):
        """Verifica si la comunidad pertenece al usuario (Seguridad)"""
        comunidad = self.obtener_por_id(comunidad_id)
        if not comunidad or comunidad.usuario_id != usuario_id:
            return False
        return True
    
    def eliminar(self, comunidad_id: int, usuario_id: int):
        if self.validar_propiedad(comunidad_id, usuario_id):
            comunidad = self.obtener_por_id(comunidad_id)
            self.db.delete(comunidad)
            self.db.commit()
            return True
        return False
    
    def actualizar(self, comunidad_id: int, datos: dict, usuario_id: int):
        # 1. Buscamos y validamos propiedad al mismo tiempo
        comunidad = self.obtener_por_id(comunidad_id)
        
        if not comunidad or comunidad.usuario_id != usuario_id:
            return None # No existe o no es tuya
            
        # 2. Actualizamos campos
        for key, value in datos.items():
            if hasattr(comunidad, key):
                setattr(comunidad, key, value)
        
        self.db.commit()
        self.db.refresh(comunidad)
        return comunidad