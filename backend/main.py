import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from routes import usuarios, comunidades, financiero, propiedades, residentes, informes, cargos, cierre, configuracion
from services import usuario_service

from database import engine, Base, get_db
import schemas
import security




# ==========================================
# ⚙️ CONFIGURACIÓN INICIAL
# ==========================================
app = FastAPI(
    title="CONADMIN API",
    description="Backend Empresarial para Administración de Comunidades",
    version="2.0.0"
)

# Configuración CORS profesional
origenes_permitidos = [
    "https://conadmin.cl",
    "https://www.conadmin.cl",
    "http://localhost:5173",  # Agregado por seguridad
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"], # FastAPI entiende el "*" para GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],
)

# Crear tablas si no existen
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Info DB: {e}")

app.include_router(usuarios.router)
app.include_router(comunidades.router)
app.include_router(financiero.router)
app.include_router(propiedades.router) # Nueva ruta para propiedades
app.include_router(residentes.router)
app.include_router(informes.router) # Nueva ruta para informes y reportes
app.include_router(cargos.router) # Nueva ruta para cargos y gastos comunes 
app.include_router(cierre.router) # Nueva ruta para cierres mensuales
app.include_router(configuracion.router) # Nueva ruta para configuración de comunidad
                   
# ==========================================
# 🔒 SISTEMA DE SEGURIDAD (Reemplazo del Decorador)
# ==========================================

# Esto le dice a FastAPI dónde está la ruta de login para que Swagger muestre el botón "Authorize"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/usuarios/login")

def obtener_usuario_actual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Esta función reemplaza a tu antiguo @token_required.
    Extrae el token, lo decodifica, busca al usuario en la BD y lo retorna.
    """
    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token expiró",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Usamos tu misma función de security.py
        payload = security.decode_access_token(token)
        if payload is None:
            raise credenciales_exception
            
        usuario_id: int = payload.get("id")
        if usuario_id is None:
            raise credenciales_exception
            
    except Exception as e:
        raise credenciales_exception

    # Llamamos al servicio para buscar al usuario (asegúrate de tener esta función en usuario_service.py)
    usuario = usuario_service.obtener_usuario_por_id(db=db, usuario_id=usuario_id)
    
    if not usuario:
        raise credenciales_exception
        
    return usuario


