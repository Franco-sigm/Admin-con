import sys
import os

# Agregamos el directorio actual al path
sys.path.insert(0, os.path.dirname(__file__))

# Importamos la variable 'app' desde main.py como 'application'
from main import app as application