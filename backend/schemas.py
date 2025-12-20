from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# --- DEFINICIÓN DE ENUMS ---
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
    usuario_id: int  # <--- ¡AGREGADO! Vital para saber quién es el dueño
    
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


# --- 5. ESQUEMAS DE TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[int] = None      # <--- AGREGADO: Útil para validaciones
    rol: Optional[str] = None     # <--- AGREGADO: Útil para permisos


# --- 6. ESQUEMAS DE USUARIO ---

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    rol: Optional[str] = "CONSERJE" 
    comunidad_id: Optional[int] = None # Dónde trabaja (para conserjes)

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    # No incluimos password aquí por seguridad
    
    # Opcional: Para ver sus comunidades si quisieras en el futuro
    # comunidades_creadas: List[Comunidad] = [] 

    class Config:
        from_attributes = True