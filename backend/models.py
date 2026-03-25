from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Enum, ForeignKey, UniqueConstraint, Float, Table
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func
from datetime import date, datetime 


# tabla intermediaruia para la relación muchos a muchos entre Residentes y Propiedades 

residente_propiedad = Table(
    'residente_propiedad',
    Base.metadata,
    Column('residente_id', Integer, ForeignKey('residentes.id', ondelete="CASCADE"), primary_key=True),
    Column('propiedad_id', Integer, ForeignKey('propiedades.id', ondelete="CASCADE"), primary_key=True)
)

# 1. TABLA COMUNIDADES (Sin cambios mayores)
class Comunidad(Base):
    __tablename__ = "comunidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    tipo = Column(String(50), nullable=True)
    unidades_totales = Column(Integer, nullable=True)
    
    __table_args__ = (
        UniqueConstraint('nombre', 'direccion', name='uq_comunidad_nombre_direccion'),
    )

    # Relaciones
    propiedades = relationship("Propiedad", back_populates="comunidad", cascade="all, delete-orphan")
    transacciones = relationship("Transaccion", back_populates="comunidad")
    
    usuario_id = Column(Integer, ForeignKey("usuarios.id")) 
    creador = relationship("Usuario", back_populates="comunidades_creadas", foreign_keys=[usuario_id])
    cierres = relationship("CierreMensual", back_populates="comunidad")

# 2. TABLA USUARIOS (Sin cambios)
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255)) 
    comunidades_creadas = relationship("Comunidad", back_populates="creador")
    rol = Column(String, default="ADMIN")



# ==========================================
# LA NUEVA ARQUITECTURA FINANCIERA Y FÍSICA
# ==========================================

# 3. TABLA PROPIEDADES (NUEVA: El inmueble físico que genera la deuda)
class Propiedad(Base):
    __tablename__ = "propiedades"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"), nullable=False)
    numero_unidad = Column(String(20), nullable=False) 
    prorrateo = Column(Float, default=0.0, nullable=False) 
    __table_args__ = (
        UniqueConstraint('comunidad_id', 'numero_unidad', name='uq_comunidad_unidad_fisica'),
    )

    # Relaciones
    comunidad = relationship("Comunidad", back_populates="propiedades")
    residentes = relationship("Residente", secondary=residente_propiedad, back_populates="propiedades")
    
    cargos = relationship("Cargo", back_populates="propiedad")
    transacciones = relationship("Transaccion", back_populates="propiedad")
    coeficiente = Column(Float, default=0.0)

    

# 4. TABLA RESIDENTES (MODIFICADA: Ahora se asocia a una Propiedad, no a un String suelto)
class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    email = Column(String(150), unique=True) 
    telefono = Column(String(20), nullable=True)
    propiedades = relationship("Propiedad", secondary=residente_propiedad, back_populates="residentes")




# 5. TABLA CARGOS (NUEVA: Las Deudas o Cobros emitidos, ej: Gasto Común de Marzo)
class Cargo(Base):
    __tablename__ = "cargos"

    id = Column(Integer, primary_key=True, index=True)
    propiedad_id = Column(Integer, ForeignKey("propiedades.id"), nullable=False)
    monto = Column(Integer, nullable=False) # En Chile usamos enteros para los montos
    concepto = Column(String(100), nullable=False) # Ej: "Gasto Común", "Multa", "Reserva Quincho"
    fecha_emision = Column(Date, default=date.today)
    fecha_vencimiento = Column(Date, nullable=False)
    estado = Column(Enum('PENDIENTE', 'PARCIAL', 'PAGADO', 'ANULADO'), default='PENDIENTE')

    # Relaciones
    propiedad = relationship("Propiedad", back_populates="cargos")
    pagos_aplicados = relationship("DetallePago", back_populates="cargo")

# 6. TABLA TRANSACCIONES (MODIFICADA: Movimientos reales de dinero en el banco/caja)
class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"), nullable=False)
    propiedad_id = Column(Integer, ForeignKey("propiedades.id"), nullable=True) # Null si es un Egreso
    
    tipo = Column(Enum('INGRESO', 'EGRESO'), nullable=False)
    metodo_pago = Column(Enum('TRANSFERENCIA', 'EFECTIVO', 'WEBPAY', 'OTRO'), nullable=False)
    monto_total = Column(Integer, nullable=False)
    fecha = Column(Date, default=date.today)
    
    # --- COMPROBANTES (Cloudinary) ---
    # Usamos 500 porque las URLs de la nube a veces son largas
    comprobante_url = Column(String(500), nullable=True) 
    comprobante_public_id = Column(String(255), nullable=True)
    
    descripcion = Column(String(255), nullable=True)
    categoria = Column(String(100), nullable=True, default="Otros") 
    
    # Relaciones
    comunidad = relationship("Comunidad", back_populates="transacciones")
    propiedad = relationship("Propiedad", back_populates="transacciones")
    detalles = relationship("DetallePago", back_populates="transaccion")
    
    fecha_creacion = Column(DateTime, server_default=func.now())
# 7. TABLA DETALLE DE PAGOS (NUEVA: La Tabla Puente / La Magia)
# Esta tabla explica CÓMO una Transacción de Ingreso pagó uno o varios Cargos
class DetallePago(Base):
    __tablename__ = "detalle_pagos"

    id = Column(Integer, primary_key=True, index=True)
    transaccion_id = Column(Integer, ForeignKey("transacciones.id"), nullable=False)
    cargo_id = Column(Integer, ForeignKey("cargos.id"), nullable=False)
    monto_abonado = Column(Integer, nullable=False) # Cuánto de la transferencia se usó para esta deuda puntual

    # Relaciones
    transaccion = relationship("Transaccion", back_populates="detalles")
    cargo = relationship("Cargo", back_populates="pagos_aplicados")

# 8. TABLA HISTORIAL INFORMES (Sin cambios)
class HistorialInforme(Base):
    __tablename__ = 'historial_informes'

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False)
    parametros = Column(String(100))
    fecha_generacion = Column(DateTime, server_default=func.now())
    
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

class CierreMensual(Base):
    __tablename__ = "cierres_mensuales"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"), nullable=False)
    
    # Identificadores de tiempo
    mes = Column(Integer, nullable=False) # 1-12
    anio = Column(Integer, nullable=False) # Ej: 2024
    
    # Totales del periodo (La "foto" financiera)
    total_ingresos = Column(Float, default=0.0)
    total_egresos = Column(Float, default=0.0)
    saldo_final = Column(Float, default=0.0) # ingresos - egresos
    
    # Metadatos
    fecha_cierre = Column(DateTime, default=datetime.utcnow)
    comprobante_resumen_url = Column(String(500), nullable=True) # <-- Aquí guardaremos el PDF en Supabase
    cerrado_por_id = Column(Integer, ForeignKey("usuarios.id"))

    # Relaciones
    comunidad = relationship("Comunidad", back_populates="cierres")
    usuario = relationship("Usuario")