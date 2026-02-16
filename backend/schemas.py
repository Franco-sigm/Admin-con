from pydantic import BaseModel, EmailStr
from typing import Optional, Any, List
from datetime import date, datetime
from enum import Enum

# ==========================================
# DEFINICIÓN DE ENUMS (Globales)
# ==========================================
class TipoTransaccion(str, Enum):
    INGRESO = 'INGRESO'
    EGRESO = 'EGRESO'

class MetodoPago(str, Enum):
    TRANSFERENCIA = 'TRANSFERENCIA'
    EFECTIVO = 'EFECTIVO'
    WEBPAY = 'WEBPAY'
    OTRO = 'OTRO'

class EsPropietario(str, Enum):
    SI = 'SI'
    NO = 'NO'

class EstadoCargo(str, Enum):
    PENDIENTE = 'PENDIENTE'
    PARCIAL = 'PARCIAL'
    PAGADO = 'PAGADO'


# ==========================================
# 1. SCHEMAS DE COMUNIDAD
# ==========================================
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


# ==========================================
# 2. SCHEMAS DE PROPIEDADES (¡NUEVO!)
# ==========================================
class PropiedadBase(BaseModel):
    numero_unidad: str # Ej: "Depto 402"

class PropiedadCreate(PropiedadBase):
    comunidad_id: int

class Propiedad(PropiedadBase):
    id: int
    comunidad_id: int

    class Config:
        from_attributes = True


# ==========================================
# 3. SCHEMAS DE RESIDENTES (Actualizado)
# ==========================================
class ResidenteBase(BaseModel):
    nombre: str
    email: Optional[EmailStr] = None 
    telefono: Optional[str] = None
    es_propietario: EsPropietario = EsPropietario.NO
    # Eliminamos 'unidad' porque ahora pertenece a Propiedad
    # Eliminamos 'estado_pago' porque se calculará con los Cargos

class ResidenteCreate(ResidenteBase):
    propiedad_id: int # Ahora se asocia a la Propiedad, no directo a la Comunidad

class ResidenteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    es_propietario: Optional[EsPropietario] = None

class Residente(ResidenteBase):
    id: int
    propiedad_id: int

    class Config:
        from_attributes = True


# ==========================================
# 4. SCHEMAS DE CARGOS / DEUDAS (¡NUEVO!)
# ==========================================
class CargoBase(BaseModel):
    monto: int # En Chile usamos enteros (CLP)
    concepto: str
    fecha_emision: Optional[date] = None # Si no se envía, la BD pone la de hoy
    fecha_vencimiento: date
    estado: EstadoCargo = EstadoCargo.PENDIENTE

class CargoCreate(CargoBase):
    propiedad_id: int

class Cargo(CargoBase):
    id: int
    propiedad_id: int

    class Config:
        from_attributes = True


# ==========================================
# 5. SCHEMAS DE TRANSACCIONES (Actualizado)
# ==========================================
class TransaccionBase(BaseModel):
    tipo: TipoTransaccion
    metodo_pago: MetodoPago
    monto_total: int
    fecha: Optional[date] = None
    descripcion: Optional[str] = None
    comprobante_url: Optional[str] = None

class TransaccionCreate(TransaccionBase):
    comunidad_id: int 
    propiedad_id: Optional[int] = None # Opcional porque un EGRESO (pagar al conserje) no tiene propiedad

class TransaccionUpdate(BaseModel):
    tipo: Optional[TipoTransaccion] = None  
    metodo_pago: Optional[MetodoPago] = None
    monto_total: Optional[int] = None
    descripcion: Optional[str] = None
    fecha: Optional[Any] = None 
    comprobante_url: Optional[str] = None

class Transaccion(TransaccionBase):
    id: int
    comunidad_id: int
    propiedad_id: Optional[int]
    
    class Config:
        from_attributes = True


# ==========================================
# 6. SCHEMAS DE DETALLE DE PAGOS (¡NUEVO!)
# ==========================================
class DetallePagoBase(BaseModel):
    cargo_id: int
    monto_abonado: int

class DetallePagoCreate(DetallePagoBase):
    transaccion_id: int

class DetallePago(DetallePagoBase):
    id: int
    transaccion_id: int

    class Config:
        from_attributes = True


# ==========================================
# 7. ESQUEMAS DE SEGURIDAD Y USUARIOS
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    id: Optional[int] = None      
    rol: Optional[str] = None     

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr 
    comunidad_id: Optional[int] = None 

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    # No incluimos password aquí por seguridad

    class Config:
        from_attributes = True