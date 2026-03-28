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

class PropiedadesPaginadas(BaseModel):
    total: int
    items: List[Propiedad]




# ==========================================
# 3. SCHEMAS DE RESIDENTES Y PROPIEDAD-RESIDENTE
# ==========================================

class ResidenteBase(BaseModel):
    nombre: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    activo: Optional[int] = 1


class ResidenteCreate(ResidenteBase):
    # Campos adicionales para creación rápida desde el padrón
    propiedad_id: Optional[int] = None 
    numero_unidad: Optional[str] = None
    prorrateo: Optional[float] = 0.0
    comunidad_id: Optional[int] = None

class ResidenteUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

class Residente(ResidenteBase):
    id: int
    # Eliminamos la lista de propiedades aquí para evitar recursión infinita
    # o la dejamos como opcional si es necesario
    
    class Config:
        from_attributes = True



# --- ESQUEMAS PARA LA PAGINACIÓN POR UNIDADES ---

class PropiedadConResidentes(BaseModel):
    """
    Este es el esquema que resuelve el Error 500.
    Representa una fila de la tabla: Una Propiedad con sus Residentes dentro.
    """
    id: int
    numero_unidad: str
    prorrateo: float
    comunidad_id: int
    # Aquí cargamos los residentes vinculados a esta propiedad específica
    residentes: List[Residente] = []

    class Config:
        from_attributes = True

class ResidentesPaginados(BaseModel):
    """
    El response_model que usa la ruta /api/residentes/comunidad/{id}
    """
    total: int
    items: List[PropiedadConResidentes] # La lista ahora es de Propiedades


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
    categoria: Optional[str] = "Otros"
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

class TransaccionesPaginadas(BaseModel):
    total: int
    items: List[Transaccion]

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
    rol: str = "ADMIN"  # Valor por defecto, pero se puede cambiar al crear el usuario

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: int
    # No incluimos password aquí por seguridad

    class Config:
        from_attributes = True

class CierreMensualBase(BaseModel):
    mes: int
    anio: int
    total_ingresos: float
    total_egresos: float
    saldo_final: float

# Esquema para la creación (si fuera necesario enviar datos manualmente)
class CierreMensualCreate(CierreMensualBase):
    comunidad_id: int

# Esquema para la respuesta (Lo que el API devuelve al Frontend)
class CierreMensual(CierreMensualBase):
    id: int
    comunidad_id: int
    fecha_cierre: datetime
    comprobante_resumen_url: Optional[str] = None
    cerrado_por_id: Optional[int] = None

    class Config:
        from_attributes = True # Permite mapear desde modelos de SQLAlchemy


class CargoUpdate(BaseModel):
    monto: Optional[int] = None
    concepto: Optional[str] = None
    fecha_vencimiento: Optional[str] = None
    estado: Optional[str] = None

    class Config:
        from_attributes = True

# SCHEMA PARA IMPORTAR RESIDENTES DESDE EXCEL (¡NUEVO!)
class ResidenteImport(BaseModel):
    numero_unidad: str
    nombre: str
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    prorrateo: Optional[float] = 0.0