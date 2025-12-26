import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy.orm import Session
from sqlalchemy import desc
import models
import schemas
import security

class UsuarioService:
    def __init__(self, db: Session):
        self.db = db

    def obtener_por_email(self, email: str):
        return self.db.query(models.Usuario).filter(models.Usuario.email == email).first()

    def obtener_por_id(self, user_id: int):
        return self.db.query(models.Usuario).filter(models.Usuario.id == user_id).first()

    def crear_usuario(self, datos: schemas.UsuarioCreate):
        # 1. Validar duplicados
        if self.obtener_por_email(datos.email):
            raise ValueError("El email ya está registrado")

        # 2. Hashear password
        hashed_password = security.get_password_hash(datos.password)

        # 3. Crear usuario
        nuevo_usuario = models.Usuario(
            nombre=datos.nombre,
            email=datos.email,
            password_hash=hashed_password,
            rol=datos.rol,
            comunidad_id=datos.comunidad_id
        )
        self.db.add(nuevo_usuario)
        self.db.commit()
        self.db.refresh(nuevo_usuario)
        return nuevo_usuario