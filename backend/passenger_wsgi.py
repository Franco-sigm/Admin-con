from a2wsgi import ASGIMiddleware
from main import app as application

# Adaptador para que cPanel pueda correr FastAPI
application = ASGIMiddleware(application)