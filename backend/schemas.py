from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# --- DEFINICIÓN DE ENUMS (Opciones fijas) ---
# Esto asegura que el frontend solo pueda enviar estas opciones exactas
class EstadoPago(str, Enum):
    AL_DIA = 'AL_DIA'
    MOROSO = 'MOROSO'

class TipoTransaccion(str, Enum):
    INGRESO = 'INGRESO'
    EGRESO = 'EGRESO'

class PrioridadAnuncio(str, Enum):
    alta = 'alta'
    normal = 'normal'
    baja = 'baja'


# --- 1. SCHEMAS DE COMUNIDAD ---
class ComunidadBase(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    tipo: Optional[str] = None
    unidades_totales: Optional[int] = None

class ComunidadCreate(ComunidadBase):
    pass

class Comunidad(ComunidadBase):
    id: int
    # Esto permite leer los datos desde la Base de Datos (SQLAlchemy)
    class Config:
        from_attributes = True


# --- 2. SCHEMAS DE RESIDENTES ---
class ResidenteBase(BaseModel):
    nombre: str
    email: Optional[str] = None
    unidad: str
    telefono: Optional[str] = None
    estado_pago: EstadoPago = EstadoPago.AL_DIA


class ResidenteCreate(ResidenteBase):
    comunidad_id: int
    

# Schema de lectura hereda del Base (lo que el cliente verá)
class Residente(ResidenteBase):
    id: int
    comunidad_id: int

    class Config:
        from_attributes = True


# --- 3. SCHEMAS DE TRANSACCIONES ---
class TransaccionBase(BaseModel):
    tipo: TipoTransaccion
    descripcion: Optional[str] = None
    monto: int
    fecha: date

class TransaccionCreate(TransaccionBase):
    comunidad_id: int

class Transaccion(TransaccionBase):
    id: int
    comunidad_id: int

    class Config:
        from_attributes = True


# --- 4. SCHEMAS DE ANUNCIOS ---
class AnuncioBase(BaseModel):
    titulo: str
    prioridad: PrioridadAnuncio = PrioridadAnuncio.normal
    mensaje: str
    

class AnuncioCreate(AnuncioBase):
    comunidad_id: int

class Anuncio(AnuncioBase):
    id: int
    comunidad_id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True





# --- ESQUEMAS DE TOKEN (Lo que devuelve el login) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- ESQUEMAS DE USUARIO ---

# 1. Base (Datos comunes)
class UsuarioBase(BaseModel):
    nombre: str
    email: str
    rol: Optional[str] = "CONSERJE" # 'ADMIN_COMUNIDAD' o 'CONSERJE'
    comunidad_id: Optional[int] = None # Solo si es conserje

# 2. Create (Lo que mandas para registrarte -> Incluye Password)
class UsuarioCreate(UsuarioBase):
    password: str

# 3. Response (Lo que devuelve la API -> ¡SIN PASSWORD!)
class Usuario(UsuarioBase):
    id: int
    # Opcional: Si quieres ver qué comunidad creó (solo IDs para no hacer bucle infinito)
    # comunidades_creadas_ids: List[int] = [] 

    class Config:
        from_attributes = True

# 4. Login (Lo que envía el formulario de entrada)
class LoginRequest(BaseModel):
    email: str
    password: str