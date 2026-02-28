import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from dotenv import load_dotenv

# Cargamos las variables del archivo .env
load_dotenv()

# Configuramos Cloudinary usando las variables de entorno
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
    api_key = os.getenv("CLOUDINARY_API_KEY"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

def subir_comprobante_cloudinary(file: UploadFile):
    try:
        # 'file.file' es el contenido binario del archivo subido por el usuario
        upload_result = cloudinary.uploader.upload(file.file)
        
        # Devolvemos la URL segura (https) que nos da Cloudinary
        return upload_result.get("secure_url")
    except Exception as e:
        # Si algo falla (ej. internet o clave mala), lo vemos en la consola
        print(f"Error al subir a Cloudinary: {e}")
        return None