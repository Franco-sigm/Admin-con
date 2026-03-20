import os
import uuid
from supabase import create_client, Client
from fastapi import UploadFile
from dotenv import load_dotenv

# Cargamos las nuevas variables del archivo .env
load_dotenv()

# CONFIGURACIÓN DE SUPABASE
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY") # service_role key
supabase: Client = create_client(url, key)

def subir_comprobante_supabase(archivo: UploadFile):
    """
    Reemplazo de la función de Cloudinary para Supabase Storage.
    Mantiene la misma lógica de entrada para no romper tus rutas.
    """
    if not archivo:
        return None
    
    try:
        # 1. Generar un nombre de archivo único para evitar que se sobrescriban
        # Ejemplo: comprobante_abc123.pdf
        extension = archivo.filename.split('.')[-1]
        nombre_unico = f"comprobante_{uuid.uuid4().hex}.{extension}"
        
        # 2. Leer el contenido binario del archivo
        file_content = archivo.file.read()
        
        # 3. Determinar el Content-Type (VITAL para el bug del PDF blanco)
        # Si es PDF, le avisamos a Supabase para que el navegador lo abra bien
        content_type = "application/pdf" if extension.lower() == "pdf" else archivo.content_type

        # 4. Subir al bucket 'comprobantes' que creamos en el panel
        res = supabase.storage.from_("comprobantes").upload(
            path=nombre_unico,
            file=file_content,
            file_options={"content-type": content_type}
        )
        
        # 5. Obtener la URL pública directa
        # Esta es la URL que guardaremos en tu base de datos MySQL
        url_publica = supabase.storage.from_("comprobantes").get_public_url(nombre_unico)
        
        return url_publica

    except Exception as e:
        print(f"Error en Supabase Storage: {e}")
        return None
    finally:
        # Importante: resetear el cursor del archivo por si se usa de nuevo
        archivo.file.seek(0)