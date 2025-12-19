from datetime import datetime, timedelta
from typing import Union
from jose import JWTError, jwt
from passlib.context import CryptContext

# 1. CONFIGURACIÓN
# IMPORTANTE: En un trabajo real, esta clave va en un archivo .env, no aquí.
# Por ahora, esta cadena larga y aleatoria.
SECRET_KEY = "ESTA_ES_UNA_CLAVE_SUPER_SECRETA_QUE_NADIE_DEBE_SABER_12345" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # El token dura 24 horas (1 día)

# 2. CONTEXTO DE ENCRIPTACIÓN (Usamos bcrypt, el estándar de la industria)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNCIONES DE UTILIDAD ---

def verify_password(plain_password, hashed_password):
    """
    Compara una contraseña normal (ej: '123') con la encriptada de la DB.
    Devuelve True si coinciden.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Toma una contraseña normal y la convierte en un hash ilegible.
    Ej: '123' -> '$2b$12$EixZaYVK1fsdf...'
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """
    Genera el Token JWT (JSON Web Token).
    Este es el string largo que el Frontend guardará para recordar la sesión.
    """
    to_encode = data.copy()
    
    # Definir cuándo expira el token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregamos la fecha de expiración a los datos
    to_encode.update({"exp": expire})
    
    # Creamos el token codificado
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt