from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --------------------------------------------------------------------------
# URL DE CONEXIÓN
# Formato: mysql+pymysql://usuario:password@host:PUERTO/nombre_base_datos
# --------------------------------------------------------------------------

# Fíjate que añadimos ":3307" después de localhost
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:admin123@localhost:3307/admin_condominios"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()