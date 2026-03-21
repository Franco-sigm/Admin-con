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

from . import usuario_service
from . import comunidad_service
from . import propiedad_service
from . import residente_service
from . import financiero_service