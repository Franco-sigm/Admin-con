from pydantic import BaseModel, EmailStr
from typing import Optional, Any, List, Literal
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
    numero_unidad: str
    prorrateo: float = 0.0
    comunidad_id: Optional[int] = None # Esto se asignará al crear la propiedad, no es necesario en el update

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

class ResidenteCreate(ResidenteBase):
    # ✅ VOLVEMOS a propiedad_id, porque React envía un número entero al crear
    propiedad_id: Optional[int] = None 
    
    # Campos "mágicos" para crear la propiedad al mismo tiempo si no existe
    numero_unidad: Optional[str] = None
    prorrateo: Optional[float] = 0.0
    comunidad_id: Optional[int] = None

class ResidenteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    es_propietario: Optional[EsPropietario] = None
    
class Residente(ResidenteBase):
    id: int
    
    # ❌ ELIMINAMOS propiedad_id: int (ya no existe en la base de datos)
    
    # ✅ AGREGAMOS la lista de propiedades (Usamos comillas por si el schema Propiedad está más abajo)
    propiedades: List["Propiedad"] = []

    class Config:
        from_attributes = True
# ==========================================
# 4. SCHEMAS DE CARGOS / DEUDAS (¡NUEVO!)
# ==========================================
class CargoBase(BaseModel):
    propiedad_id: int
    monto: int
    concepto: str
    fecha_vencimiento: date
    # El estado por defecto será PENDIENTE si no se envía
    estado: Literal['PENDIENTE', 'PARCIAL', 'PAGADO'] = 'PENDIENTE'

class CargoCreate(CargoBase):
    pass

class Cargo(CargoBase):
    id: int
    fecha_emision: date  # La base de datos lo genera, así que lo devolvemos al leer

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


