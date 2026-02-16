from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # <- IMPORTANTE PARA EL LOGIN
from sqlalchemy.orm import Session
import schemas
from database import get_db

# Importamos la seguridad y los servicios
from security import crear_token_acceso, obtener_usuario_actual
from services import usuario_service

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Administración de Usuarios"]
)

@router.post("/", response_model=schemas.Usuario, status_code=201)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario (Administrador) en el sistema.
    """
    return usuario_service.crear_usuario(db=db, usuario=usuario)

# ==========================================
# 🔑 EL ENDPOINT DE LOGIN (¡Lo que faltaba!)
# ==========================================
@router.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para iniciar sesión. Recibe email y password, y devuelve un Token JWT.
    """
    # Swagger envía el email dentro del campo 'username'
    usuario = usuario_service.obtener_usuario_por_email(db=db, email=form_data.username)
    
    # Verificamos si existe y si la clave coincide (asegúrate de tener esta función en tu service)
    if not usuario or not usuario_service.verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Fabricamos el Token JWT
    access_token = crear_token_acceso(data={"id": usuario.id, "email": usuario.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================

# (Opcional) Endpoint para buscar a un usuario
@router.get("/{email}", response_model=schemas.Usuario)
def obtener_usuario(email: str, db: Session = Depends(get_db)):
    usuario = usuario_service.obtener_usuario_por_email(db=db, email=email)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario