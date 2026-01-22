import bcrypt
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError # Requiere: pip install python-jose

# ---------------------------------------------------
# CONFIGURACIÓN
# ---------------------------------------------------
# Intenta leer la llave del .env, si no hay, usa una por defecto (Inseguro para prod, cámbialo)
SECRET_KEY = os.getenv("SECRET_KEY", "super-secreto-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 horas de sesión

# ---------------------------------------------------
# LÓGICA DE CONTRASEÑAS (código aprobado)
# ---------------------------------------------------

def verify_password(plain_password, hashed_password):
    """Verifica si una contraseña plana coincide con el hash"""
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(plain_password, hashed_password)

def get_password_hash(password):
    """Genera un hash seguro para la contraseña"""
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    return hashed.decode('utf-8')



def create_access_token(data: dict):
    """Crea un token JWT con tiempo de expiración"""
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    """Decodifica y valida el token. Retorna el payload o None si es inválido"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None