import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

# --------------------------------------------------------------------------
# CONFIGURACIÓN PARA FLASK
# --------------------------------------------------------------------------

# 1. URL DE CONEXIÓN
# (Asegúrate de que este sea tu usuario/clave/puerto correcto en local)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:admin123@localhost:3307/admin_condominios"
)

# 2. CREAR EL MOTOR
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_recycle=3600)

# 3. SESIÓN (Aquí está la clave: definimos 'db_session' que Flask necesita)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# 4. BASE DECLARATIVA
Base = declarative_base()
Base.query = db_session.query_property() # Esto ayuda a Flask a hacer consultas más fácil

def init_db():
    # Importamos los modelos dentro de la función para evitar ciclos
    import models
    Base.metadata.create_all(bind=engine)