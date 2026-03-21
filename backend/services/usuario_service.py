from sqlalchemy.orm import Session
from fastapi import HTTPException
import models
import schemas
from passlib.context import CryptContext

# Configuración del motor de encriptación
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

# ==========================================
# 🔑 NUEVA FUNCIÓN: VERIFICAR CONTRASEÑA
# ==========================================
def verificar_password(plain_password: str, hashed_password: str):
    """
    Toma la contraseña en texto plano (del login) y verifica si coincide
    con el hash encriptado guardado en la base de datos.
    """
    return pwd_context.verify(plain_password, hashed_password)

def crear_usuario(db: Session, usuario: schemas.UsuarioCreate):
    # 1. Verificar si el correo ya existe
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Este email ya está registrado en el sistema.")

    # 2. Encriptar la contraseña (¡NUNCA guardar en texto plano!)
    hashed_password = get_password_hash(usuario.password)

    # 3. Crear el usuario en la base de datos
    db_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password_hash=hashed_password
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def obtener_usuario_por_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

# ==========================================
# 🔍 NUEVA FUNCIÓN: OBTENER POR ID
# ==========================================
def obtener_usuario_por_id(db: Session, usuario_id: int):
    """
    Esta función es vital para security.py. 
    Busca al usuario usando el ID que viene dentro del Token JWT.
    """
    return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()