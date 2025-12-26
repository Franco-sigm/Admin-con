import sys
import os

# --- EL TRUCO DEL PATH ---
# Obtenemos la ruta de la carpeta actual (services)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Obtenemos la ruta padre (public_html o la raíz del proyecto)
parent_dir = os.path.dirname(current_dir)

# Agregamos la ruta padre al sistema para que Python encuentre 'security', 'models', etc.
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
# -------------------------

# Ahora importamos los servicios normalmente
from .usuario_service import UsuarioService
from .comunidad_service import ComunidadService
from .residente_service import ResidenteService
from .transaccion_service import TransaccionService