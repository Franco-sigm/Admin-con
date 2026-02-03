from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func
import datetime

# 1. TABLA COMUNIDADES
class Comunidad(Base):
    __tablename__ = "comunidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    direccion = Column(String(200), nullable=True)
    tipo = Column(String(50), nullable=True)
    unidades_totales = Column(Integer, nullable=True)
    
    # --- RELACIONES CON EL CONTENIDO ---
    residentes = relationship("Residente", back_populates="comunidad")
    transacciones = relationship("Transaccion", back_populates="comunidad")
   
    
    # --- RELACIÓN 1: DUEÑO/ADMIN (Quién creó la comunidad) ---
    usuario_id = Column(Integer, ForeignKey("usuarios.id")) 
    creador = relationship("Usuario", back_populates="comunidades_creadas", foreign_keys=[usuario_id])

    # --- RELACIÓN 2: EL EQUIPO (Usuarios que trabajan aquí, ej: Conserjes) ---
    # Esto permite hacer: comunidad.equipo (y te da la lista de conserjes)
    equipo = relationship("Usuario", back_populates="comunidad_trabajo", foreign_keys="Usuario.comunidad_id")


# 2. TABLA USUARIOS
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255)) 
    rol = Column(String(50), default="CONSERJE") 
    
    # --- RELACIÓN 1: ¿DÓNDE TRABAJA? (Para Conserjes) ---
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"), nullable=True)
    comunidad_trabajo = relationship("Comunidad", back_populates="equipo", foreign_keys=[comunidad_id])

    # --- RELACIÓN 2: ¿QUÉ ADMINISTRA? (Para Admins) ---
    # Esto permite hacer: usuario.comunidades_creadas (y te da la lista de sus edificios)
    comunidades_creadas = relationship("Comunidad", back_populates="creador", foreign_keys=[Comunidad.usuario_id])

# 2. Tabla Residentes
class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    nombre = Column(String(100))
    email = Column(String(150))
    unidad = Column(String(20))
    telefono = Column(String(20), nullable=True)
    estado_pago = Column(Enum('AL_DIA', 'MOROSO'), default='AL_DIA')

    # Relación inversa: "Este residente pertenece a una comunidad"
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

