
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routes import router as api_router

# Esto crea las tablas en MySQL automáticamente si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuración de CORS (Para que el Frontend pueda conectarse)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluimos las rutas que definimos en routes.py
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"mensaje": "API AdminCon (Modo POO) funcionando 🚀"}