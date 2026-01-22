import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --------------------------------------------------------------------------
# CONFIGURACIÓN PARA FLASK
# --------------------------------------------------------------------------

# 1. URL DE CONEXIÓN
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Validación de seguridad: Si estamos en producción y no hay URL, detenerse.
# 
if not SQLALCHEMY_DATABASE_URL:
    # produccion
    raise ValueError("DATABASE_URL no está configurada en las variables de entorno.")
# 2. CREAR EL MOTOR (CORREGIDO PARA CPANEL)
# pool_recycle=280: Evita el error "MySQL server has gone away" reciclando antes de los 5 min.
# pool_pre_ping=True: Verificar la conexión antes de cada consulta.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_recycle=280, 
    pool_pre_ping=True
)

# 3. SESIÓN
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# 4. BASE DECLARATIVA
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # Importamos los modelos dentro de la función para evitar ciclos
    import models
    Base.metadata.create_all(bind=engine)