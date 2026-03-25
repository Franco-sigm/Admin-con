import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Importaciones locales
from database import get_db
from services import usuario_service

# Configuraciones de seguridad
SECRET_KEY = os.getenv('SECRET_KEY', 'clave-super-secreta-cambiar-en-env')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8 # El token dura 8 horas

# Le decimos a FastAPI dónde está la ruta de login para que arme el botón "Authorize" en Swagger
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/usuarios/login")

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    """Genera el Token JWT cuando el usuario hace login exitosamente."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Esta es la función barrera (Depends). 
    Se encarga de interceptar el token, abrirlo, ver quién es y dejarlo pasar.
    """
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token expiró",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificamos el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extraemos el ID que guardamos dentro del token
        usuario_id: int = payload.get("id")
        if usuario_id is None:
            raise credenciales_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado")
    except jwt.InvalidTokenError:
        raise credenciales_exception

    # Buscamos al usuario en la base de datos para confirmar que sigue existiendo
    usuario = usuario_service.obtener_usuario_por_id(db=db, usuario_id=usuario_id)
    if not usuario:
        raise credenciales_exception
        
    return usuario