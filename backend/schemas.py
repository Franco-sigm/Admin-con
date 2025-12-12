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