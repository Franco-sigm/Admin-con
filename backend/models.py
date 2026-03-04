from sqlalchemy import Column, Integer, String, Date, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func
import datetime

# 1. TABLA COMUNIDADES
class Comunidad(Base):
    __tablename__ = "comunidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    tipo = Column(String(50), nullable=True)
    unidades_totales = Column(Integer, nullable=True)
    
    #EL CANDADO: Evita duplicar el mismo edificio en la misma dirección
    __table_args__ = (
        UniqueConstraint('nombre', 'direccion', name='uq_comunidad_nombre_direccion'),
    )

    # --- RELACIONES CON EL CONTENIDO ---
    residentes = relationship("Residente", back_populates="comunidad")
    transacciones = relationship("Transaccion", back_populates="comunidad")
   
    # --- RELACIÓN ÚNICA: DUEÑO/ADMIN (Quién administra la comunidad) ---
    usuario_id = Column(Integer, ForeignKey("usuarios.id")) 
    creador = relationship("Usuario", back_populates="comunidades_creadas", foreign_keys=[usuario_id])


# 2. TABLA USUARIOS
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255)) 
    comunidades_creadas = relationship("Comunidad", back_populates="creador")

# 2. Tabla Residentes
class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    nombre = Column(String(100))
    
    # CANDADO 1: El correo debe ser único en toda la base de datos
    email = Column(String(150)) 
    
    unidad = Column(String(20))
    telefono = Column(String(20), nullable=True)
    estado_pago = Column(Enum('AL_DIA', 'MOROSO'), default='AL_DIA')

    # CANDADO 2: Un residente por unidad dentro de la misma comunidad.
    # Evita que registres a dos personas distintas en el "Depto 101" de la Comunidad 1.
    __table_args__ = (
        UniqueConstraint('comunidad_id', 'unidad', name='uq_comunidad_unidad'),
    )

    # Relación inversa
    comunidad = relationship("Comunidad", back_populates="residentes")

# 3. Tabla Transacciones (Pagos y Gastos)
class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    tipo = Column(Enum('INGRESO', 'EGRESO'))
    descripcion = Column(String(255), nullable=True)
    categoria = Column(String(50))
    monto = Column(Integer)
    fecha = Column(Date)

    comunidad = relationship("Comunidad", back_populates="transacciones")

class HistorialInforme(Base):
    __tablename__ = 'historial_informes'

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False) # Ej: "Balance Mensual", "Lista Residentes"
    parametros = Column(String(100))          # Ej: "Mes: 05, Año: 2025"
    fecha_generacion = Column(DateTime, server_default=func.now())
    
    # Relación: Un informe es generado por un Usuario
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))

