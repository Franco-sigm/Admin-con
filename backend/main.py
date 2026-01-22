import os 
from dotenv import load_dotenv # <--- 1. IMPORTAR ESTO

# 2. CARGAR VARIABLES ANTES DE CUALQUIER OTRA IMPORTACIÓN LOCAL
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
from pydantic import ValidationError

# Importaciones locales
from database import db_session, engine, Base
import schemas
import security
from services import UsuarioService, ComunidadService, ResidenteService, TransaccionService

# ==========================================
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

# Crear tablas si no existen
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Info DB: {e}")

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

# ==========================================
# 🔒 DECORADOR DE SEGURIDAD
# ==========================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token es requerido'}), 401

        try:
            payload = security.decode_access_token(token)
            if payload is None:
                 return jsonify({'message': 'Token inválido o expirado'}), 401
            
            user_service = UsuarioService(db_session)
            current_user = user_service.obtener_por_id(payload.get("id"))
            
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Error de autenticación', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ==========================================
# 🔑 AUTH & LOGIN
# ==========================================

@app.route("/register", methods=['POST'])
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

@app.route("/token", methods=['POST'])
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
        data={"sub": user.email, "id": user.id, "rol": user.rol}
    )
    return jsonify({"access_token": access_token, "token_type": "bearer"}), 200

# ==========================================
# 🏠 RUTAS DE COMUNIDADES
# ==========================================

@app.route("/comunidades", methods=['POST'])
@token_required
def create_comunidad(current_user):
    data = request.get_json()
    service = ComunidadService(db_session)
    try:
        schema = schemas.ComunidadCreate(**data)
        nueva = service.crear(schema, current_user.id)
        return jsonify({"id": nueva.id, "nombre": nueva.nombre}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/comunidades", methods=['GET'])
@token_required
def get_comunidades(current_user):
    service = ComunidadService(db_session)
    lista = service.obtener_por_usuario(current_user.id)
    return jsonify([
        {"id": c.id, "nombre": c.nombre, "direccion": c.direccion, "tipo": c.tipo, "unidades_totales": c.unidades_totales} 
        for c in lista
    ]), 200

@app.route("/comunidades/<int:id>", methods=['GET'])
@token_required
def get_single_comunidad(current_user, id):
    service = ComunidadService(db_session)
    if not service.validar_propiedad(id, current_user.id):
        return jsonify({"detail": "No encontrado o no autorizado"}), 404
    
    comunidad = service.obtener_por_id(id)
    return jsonify({
        "id": comunidad.id, 
        "nombre": comunidad.nombre,
        "direccion": comunidad.direccion,
        "tipo": comunidad.tipo
    }), 200

@app.route("/comunidades/<int:id>", methods=['DELETE'])
@token_required
def delete_comunidad(current_user, id):
    service = ComunidadService(db_session)
    if service.eliminar(id, current_user.id):
        return jsonify({"message": "Eliminado correctamente"}), 200
    return jsonify({"detail": "No autorizado o no encontrado"}), 403

@app.route("/comunidades/<int:id>", methods=['PUT'])
@token_required
def update_comunidad(current_user, id):
    data = request.get_json()
    service = ComunidadService(db_session)
    comunidad_actualizada = service.actualizar(id, data, current_user.id)
    if comunidad_actualizada:
        return jsonify({"message": "Comunidad actualizada", "nombre": comunidad_actualizada.nombre}), 200
    return jsonify({"detail": "No autorizado o comunidad no encontrada"}), 403

# ==========================================
# 👥 RUTAS DE RESIDENTES
# ==========================================

@app.route("/residentes", methods=['POST'])
@token_required
def create_residente(current_user):
    data = request.get_json()
    com_service = ComunidadService(db_session)
    res_service = ResidenteService(db_session)
    try:
        schema = schemas.ResidenteCreate(**data)
        if not com_service.validar_propiedad(schema.comunidad_id, current_user.id):
            return jsonify({"detail": "No tienes permiso en esta comunidad"}), 403
        nuevo = res_service.crear(schema)
        return jsonify({"id": nuevo.id, "nombre": nuevo.nombre}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/residentes", methods=['GET'])
@token_required
def get_residentes(current_user):
    comunidad_id = request.args.get('comunidad_id')
    if not comunidad_id:
        return jsonify({"detail": "Falta parametro ?comunidad_id=X"}), 400
    
    com_service = ComunidadService(db_session)
    if not com_service.validar_propiedad(int(comunidad_id), current_user.id):
        return jsonify({"detail": "No autorizado"}), 403
        
    res_service = ResidenteService(db_session)
    lista = res_service.obtener_por_comunidad(comunidad_id)
    return jsonify([
        {"id": r.id, "nombre": r.nombre, "email": r.email, "unidad": r.unidad, "estado_pago": r.estado_pago}
        for r in lista
    ]), 200

# NUEVA RUTA: Para obtener un solo residente (Corrige error 405 en edición)
@app.route("/residentes/<int:id>", methods=['GET'])
@token_required
def get_single_residente(current_user, id):
    res_service = ResidenteService(db_session)
    com_service = ComunidadService(db_session)

    residente = res_service.obtener_por_id(id)
    if not residente:
        return jsonify({"detail": "Residente no encontrado"}), 404

    # Seguridad: Verificar propiedad
    if not com_service.validar_propiedad(residente.comunidad_id, current_user.id):
        return jsonify({"detail": "No autorizado"}), 403

    return jsonify({
        "id": residente.id,
        "nombre": residente.nombre,
        "email": residente.email,
        "unidad": residente.unidad,
        "estado_pago": residente.estado_pago,
        "comunidad_id": residente.comunidad_id
    }), 200

@app.route("/residentes/<int:id>", methods=['DELETE'])
@token_required
def delete_residente(current_user, id):
    res_service = ResidenteService(db_session)
    com_service = ComunidadService(db_session)

    # 1. Buscar al residente
    residente = res_service.obtener_por_id(id)
    if not residente:
        return jsonify({"detail": "Residente no encontrado"}), 404

    # 2. SEGURIDAD: ¿Es tu edificio?
    if not com_service.validar_propiedad(residente.comunidad_id, current_user.id):
        return jsonify({"detail": "No tienes permiso para eliminar residentes de esta comunidad"}), 403

    # 3. Eliminar
    if res_service.eliminar(id):
        return jsonify({"message": "Residente eliminado"}), 200
    return jsonify({"detail": "Error al eliminar"}), 400

@app.route("/residentes/<int:id>", methods=['PUT'])
@token_required
def update_residente(current_user, id):
    data = request.get_json()
    
    res_service = ResidenteService(db_session)
    com_service = ComunidadService(db_session) 
    
    # 1. Buscar el residente primero
    residente_db = res_service.obtener_por_id(id)
    if not residente_db:
        return jsonify({"detail": "Residente no encontrado"}), 404

    # 2. SEGURIDAD: Validación de Propiedad
    if not com_service.validar_propiedad(residente_db.comunidad_id, current_user.id):
        return jsonify({"detail": "⛔ ACCESO DENEGADO: No puedes editar residentes de otra comunidad"}), 403

    # 3. Actualizar con validación
    try:
        schema = schemas.ResidenteUpdate(**data) 
        residente_actualizado = res_service.actualizar(id, schema)
        
        return jsonify({
            "message": "Residente actualizado", 
            "nombre": residente_actualizado.nombre
        }), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

# ==========================================
#  RUTAS DE TRANSACCIONES
# ==========================================

@app.route("/transacciones", methods=['POST'])
@token_required
def create_transaccion(current_user):
    data = request.get_json()
    com_service = ComunidadService(db_session)
    tx_service = TransaccionService(db_session)
    try:
        schema = schemas.TransaccionCreate(**data)
        if not com_service.validar_propiedad(schema.comunidad_id, current_user.id):
            return jsonify({"detail": "No autorizado"}), 403
        nueva = tx_service.crear(schema)
        return jsonify({"id": nueva.id, "monto": nueva.monto}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/transacciones/<int:comunidad_id>", methods=['GET'])
@token_required
def get_transacciones(current_user, comunidad_id):
    com_service = ComunidadService(db_session)
    if not com_service.validar_propiedad(comunidad_id, current_user.id):
        return jsonify({"detail": "No autorizado"}), 403
    
    tx_service = TransaccionService(db_session)
    lista = tx_service.obtener_por_comunidad(comunidad_id)
    return jsonify([
        {"id": t.id, "tipo": t.tipo, "monto": t.monto, "descripcion": t.descripcion, "categoria": t.categoria, "fecha": t.fecha.isoformat() if t.fecha else None}
        for t in lista
    ]), 200

@app.route("/transacciones/<int:transaccion_id>", methods=['PUT'])
@token_required
def update_transaccion(current_user, transaccion_id):
    data = request.get_json()
    tx_service = TransaccionService(db_session)
    com_service = ComunidadService(db_session)

    # 1. Buscar la transacción
    transaccion = tx_service.obtener_por_id(transaccion_id)
    if not transaccion:
        return jsonify({"detail": "Transacción no encontrada"}), 404

    # 2. SEGURIDAD: ¿Es tu edificio?
    if not com_service.validar_propiedad(transaccion.comunidad_id, current_user.id):
        return jsonify({"detail": "No tienes permiso para editar esta transacción"}), 403

    # 3. Actualizar
    try:
        # IMPORTANTE: Validamos los datos con el Schema antes de actualizar
        schema = schemas.TransaccionUpdate(**data)
        transaccion_actualizada = tx_service.actualizar(transaccion_id, schema)
        
        if transaccion_actualizada:
            return jsonify({
                "message": "Transacción actualizada correctamente",
                "id": transaccion_actualizada.id,
                "monto": transaccion_actualizada.monto
            }), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400
    except Exception as e:
         return jsonify({"detail": str(e)}), 400
    
    return jsonify({"detail": "Error al actualizar"}), 400

@app.route("/transacciones/<int:id>", methods=['DELETE'])
@token_required
def delete_transaccion(current_user, id):
    tx_service = TransaccionService(db_session)
    com_service = ComunidadService(db_session)

    # 1. Buscar primero
    transaccion = tx_service.obtener_por_id(id)
    if not transaccion:
        return jsonify({"detail": "Transacción no encontrada"}), 404

    # 2. SEGURIDAD
    if not com_service.validar_propiedad(transaccion.comunidad_id, current_user.id):
        return jsonify({"detail": "No autorizado"}), 403

    # 3. Eliminar
    if tx_service.eliminar(id):
        return jsonify({"message": "Eliminado"}), 200
    return jsonify({"detail": "Error al eliminar"}), 400

# ==========================================
# 🚀 ARRANQUE
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)