from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import date, datetime
from enum import Enum


# --- DEFINICIÓN DE ENUMS (Globales) ---
class EstadoPago(str, Enum):
    AL_DIA = 'AL_DIA'
    MOROSO = 'MOROSO'

class TipoTransaccion(str, Enum):
    INGRESO = 'INGRESO'
    EGRESO = 'EGRESO'




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
    usuario_id: int  
    
    class Config:
        from_attributes = True


# --- 2. SCHEMAS DE RESIDENTES ---
class ResidenteBase(BaseModel):
    nombre: str
    # Usamos EmailStr para validar que sea un correo real (user@mail.com)
    email: Optional[EmailStr] = None 
    unidad: str
    telefono: Optional[str] = None
    estado_pago: EstadoPago = EstadoPago.AL_DIA

class ResidenteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    unidad: Optional[str] = None
    estado_pago: Optional[str] = None

class ResidenteCreate(ResidenteBase):
    comunidad_id: int

class Residente(ResidenteBase):
    id: int
    comunidad_id: int

    class Config:
        from_attributes = True


# --- 3. SCHEMAS DE TRANSACCIONES ---

# Falta este esquema Base para que los demás funcionen
class TransaccionBase(BaseModel):
    tipo: TipoTransaccion
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    monto: int
    fecha: date

# Esquema para crear (POST)
class TransaccionCreate(TransaccionBase):
    comunidad_id: int 

# Esquema para actualizar (PUT) - Súper flexible para evitar Error 400
class TransaccionUpdate(BaseModel):
    tipo: Optional[Any] = None  
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    monto: Optional[int] = None
    fecha: Optional[Any] = None # Permitimos Any para procesar el string del frontend

# Esquema de respuesta (GET)
class TransaccionResponse(TransaccionBase):
    id: int
    comunidad_id: int
    
    class Config:
        from_attributes = True




# --- 5. ESQUEMAS DE TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[int] = None      
    rol: Optional[str] = None     


# --- 6. ESQUEMAS DE USUARIO ---

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr # Validación fuerte de email
    rol: Optional[str] = "CONSERJE" 
    comunidad_id: Optional[int] = None 

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    # No incluimos password aquí por seguridad

    class Config:
        from_attributes = True