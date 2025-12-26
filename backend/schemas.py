from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# --- DEFINICIÓN DE ENUMS (Globales) ---
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

class ResidenteCreate(ResidenteBase):
    comunidad_id: int

class Residente(ResidenteBase):
    id: int
    comunidad_id: int

    class Config:
        from_attributes = True


# --- 3. SCHEMAS DE TRANSACCIONES ---
# (Aquí borré el Enum repetido TipoTransaccion, ya está arriba)

# Esquema base
class TransaccionBase(BaseModel):
    tipo: TipoTransaccion
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    monto: int
    fecha: date

# Esquema para crear (Create)
class TransaccionCreate(TransaccionBase):
    comunidad_id: int 

# Esquema para leer (Response)
class Transaccion(TransaccionBase):
    id: int
    
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
    fecha_creacion: Optional[datetime] = None # Hacemos opcional por si la DB lo genera sola

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