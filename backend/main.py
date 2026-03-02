import os 
from dotenv import load_dotenv 

load_dotenv()

from flask import Flask
from flask_cors import CORS
from database import db_session, Base, engine
from functools import wraps
from routes.auth_routes import auth_bp
from routes.comunidades_routes import comunidades_bp
from routes.residentes_routes import residentes_bp
from routes.transacciones_routes import transacciones_bp
from routes.informes_routes import informes_bp



# ⚙️ CONFIGURACIÓN INICIAL
# ==========================================
app = Flask(__name__)

# Seguridad
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'clave-super-secreta-cambiar-en-env')

# Configuración CORS profesional
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://conadmin.cl",       # Dominio principal
            "https://www.conadmin.cl",   # Subdominio www
            "http://localhost:5173",     # Desarrollo local
            "http://127.0.0.1:5173"  
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
    }
})

app.register_blueprint(auth_bp)
app.register_blueprint(comunidades_bp)
app.register_blueprint(residentes_bp)
app.register_blueprint(transacciones_bp)
app.register_blueprint(informes_bp)

# =====================================

# Crear tablas si no existen
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Info DB: {e}")

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()




# ARRANQUE


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)