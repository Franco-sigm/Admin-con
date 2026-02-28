import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv

# Cargamos variables de entorno
load_dotenv()

# CONFIGURACIÓN GLOBAL
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True  # Para que las URLs generadas sean siempre https
)

def subir_comprobante_cloudinary(archivo: UploadFile):
    if not archivo:
        return None
    try:
        # El archivo.file es el objeto binario que espera cloudinary
        upload_result = cloudinary.uploader.upload(
            archivo.file,
            folder="comprobantes_admincon",
            resource_type="auto" # Detecta automáticamente si es PDF o Imagen
        )
        return upload_result.get("secure_url")
    except Exception as e:
        print(f"Error en Cloudinary: {e}")
        return None