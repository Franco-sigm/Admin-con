import bcrypt
import os
from datetime import datetime, timedelta
from jose import jwt, JWTError # Requiere: pip install python-jose

# Importaciones nuevas necesarias para el decorador
from functools import wraps
from flask import request, jsonify
from database import db_session


# ---------------------------------------------------
# CONFIGURACIÓN
# ---------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "super-secreto-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8 # 8 horas de sesión

# ---------------------------------------------------
# LÓGICA DE CONTRASEÑAS Y TOKENS
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

# ---------------------------------------------------
# 🔒 DECORADOR DE SEGURIDAD (Migrado desde main.py)
# ---------------------------------------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token es requerido'}), 401

        try:
            # Usamos la función decode_access_token que está justo arriba
            payload = decode_access_token(token) 
            if payload is None:
                 return jsonify({'message': 'Token inválido o expirado'}), 401
            from services.usuario_service import UsuarioService
            
            user_service = UsuarioService(db_session)
            current_user = user_service.obtener_por_id(payload.get("id"))
            
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Error de autenticación', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated