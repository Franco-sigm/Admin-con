from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routes import router as api_router

# Crear tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
# Aquí definimos quién tiene permiso para hablar con el backend
origins = [
    "http://localhost:5173",      # Tu Frontend (nombre estándar)
    "http://127.0.0.1:5173",      # Tu Frontend (IP numérica)
    "http://localhost:8000",      # Backend (por si acaso)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Lista de permisos de arriba
    allow_credentials=True,       # Permitir cookies/tokens
    allow_methods=["*"],          # Permitir todo (GET, POST, PUT, DELETE)
    allow_headers=["*"],          # Permitir todos los encabezados
)

# --- RUTAS ---
# Sin prefijos raros, directo al grano.
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"mensaje": "API AdminCon funcionando y desbloqueada 🔓"}