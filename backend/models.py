from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. Tabla Comunidades (El Padre)
class Comunidad(Base):
    __tablename__ = "comunidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    direccion = Column(String(200))

    # Relaciones: Esto le dice a Python "una comunidad tiene muchos residentes/transacciones/anuncios"
    residentes = relationship("Residente", back_populates="comunidad")
    transacciones = relationship("Transaccion", back_populates="comunidad")
    anuncios = relationship("Anuncio", back_populates="comunidad")

# 2. Tabla Residentes
class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    nombre = Column(String(100))
    email = Column(String(100))
    telefono = Column(String(20))
    unidad = Column(String(20))
    # ENUM debe coincidir con lo que creaste en MySQL
    estado_pago = Column(Enum('AL_DIA', 'MOROSO'), default='AL_DIA')

    # Relación inversa: "Este residente pertenece a una comunidad"
    comunidad = relationship("Comunidad", back_populates="residentes")

# 3. Tabla Transacciones (Pagos y Gastos)
class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    tipo = Column(Enum('INGRESO', 'EGRESO'))
    monto = Column(Integer)
    descripcion = Column(String(255))
    fecha = Column(Date)

    comunidad = relationship("Comunidad", back_populates="transacciones")

# 4. Tabla Anuncios (Dashboard)
class Anuncio(Base):
    __tablename__ = "anuncios"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    titulo = Column(String(150))
    mensaje = Column(Text)
    prioridad = Column(Enum('alta', 'normal', 'baja'), default='normal')
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)

    comunidad = relationship("Comunidad", back_populates="anuncios")