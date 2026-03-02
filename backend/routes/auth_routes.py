from flask import Blueprint, request, jsonify
from database import db_session
from services.usuario_service import UsuarioService
import schemas
import security
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)

 #==========================================
# 🔑 AUTH & LOGIN
# ==========================================

@auth_bp.route("/register", methods=['POST'])
def register():
    data = request.get_json()
    service = UsuarioService(db_session)
    try:
        schema = schemas.UsuarioCreate(**data)
        nuevo_usuario = service.crear_usuario(schema)
        return jsonify({"id": nuevo_usuario.id, "email": nuevo_usuario.email}), 200
    except ValueError as e:
        return jsonify({"detail": str(e)}), 400
    except ValidationError as e:
        return jsonify(e.errors()), 400

@auth_bp.route("/token", methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'password' not in data:
         return jsonify({"detail": "Faltan credenciales"}), 400

    username = data.get('username') or data.get('email')
    if not username:
        return jsonify({"detail": "Falta usuario/email"}), 400

    service = UsuarioService(db_session)
    user = service.obtener_por_email(username)
    
    if not user or not security.verify_password(data['password'], user.password_hash):
        return jsonify({"detail": "Credenciales incorrectas"}), 401
        
    access_token = security.create_access_token(
        data={"sub": user.email, "id": user.id}
    )
    return jsonify({"access_token": access_token, "token_type": "bearer"}), 200