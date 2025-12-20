from datetime import datetime, timedelta
from typing import Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db # <--- Importamos la conexión DB
import models # <--- Importamos tus tablas

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Esta función se ejecuta automáticamente en cada ruta protegida.
    1. Lee el token del encabezado.
    2. Verifica que sea válido y no haya expirado.
    3. Busca al usuario en la DB por su email.
    4. Si todo está bien, devuelve al usuario (con su ID).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Intentamos decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # FastAPI usa "sub" por estándar para guardar el identificador (email)
        email: str = payload.get("sub") 
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Buscamos al usuario en la Base de Datos
    user = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    
    if user is None:
        raise credentials_exception
        
    return user