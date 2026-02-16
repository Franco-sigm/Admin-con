import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --------------------------------------------------------------------------
# CONFIGURACIÓN PARA FASTAPI (Versión Empresarial)
# --------------------------------------------------------------------------

# 1. URL DE CONEXIÓN
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Validación de seguridad: Si estamos en producción y no hay URL, detenerse.
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en las variables de entorno.")

# 2. CREAR EL MOTOR 
# Mantenemos las optimizaciones para MySQL:
# pool_recycle=280: Evita el error "MySQL server has gone away" reciclando antes de los 5 min.
# pool_pre_ping=True: Verificar la conexión antes de cada consulta.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_recycle=280, 
    pool_pre_ping=True
)

# 3. SESIÓN LOCAL (El estándar de FastAPI)
# Eliminamos scoped_session. Ahora creamos una fábrica de sesiones.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. BASE DECLARATIVA
Base = declarative_base()
# Eliminamos Base.query = db_session.query_property() ya que FastAPI inyecta la sesión dinámicamente.

# 5. INYECCIÓN DE DEPENDENCIAS (¡La magia de FastAPI!)
# Esta función abre una conexión cuando entra una petición (ej: crear residente) 
# y se asegura de cerrarla (finally) sin importar si hubo un error o no.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()