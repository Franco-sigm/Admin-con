from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# 1. CONFIGURACIÓN
# Si tienes variables de entorno las usa, si no, usa la fija (igual que tenías)
SECRET_KEY = os.getenv("SECRET_KEY", "ESTA_ES_UNA_CLAVE_SUPER_SECRETA_QUE_NADIE_DEBE_SABER_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas

# 2. CONTEXTO DE ENCRIPTACIÓN
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNCIONES DE UTILIDAD (Estas no cambian) ---

def verify_password(plain_password, hashed_password):
    """Verifica si la contraseña coincide con el hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Encripta la contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea el Token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """
    NUEVA FUNCIÓN PARA FLASK:
    Solo decodifica el token y devuelve los datos.
    La validación del usuario la hacemos en main.py para evitar errores de importación.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None