from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. Tabla Comunidades (El Padre)
class Comunidad(Base):
    __tablename__ = "comunidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    direccion = Column(String(200), nullable=True)
    tipo = Column(String(50), nullable=True)
    unidades_totales = Column(Integer, nullable=True)
    residentes = relationship("Residente", back_populates="comunidad")
    transacciones = relationship("Transaccion", back_populates="comunidad")
    anuncios = relationship("Anuncio", back_populates="comunidad")

# 2. Tabla Residentes
class Residente(Base):
    __tablename__ = "residentes"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    nombre = Column(String(100))
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
    monto = Column(Integer)
    fecha = Column(Date)

    comunidad = relationship("Comunidad", back_populates="transacciones")

# 4. Tabla Anuncios (Dashboard)
class Anuncio(Base):
    __tablename__ = "anuncios"

    id = Column(Integer, primary_key=True, index=True)
    comunidad_id = Column(Integer, ForeignKey("comunidades.id"))
    titulo = Column(String(150))
    prioridad = Column(Enum('alta', 'normal', 'baja'), default='normal')
    mensaje = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)

    comunidad = relationship("Comunidad", back_populates="anuncios")