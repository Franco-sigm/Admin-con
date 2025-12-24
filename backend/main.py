from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from database import db_session, engine, Base
import models
import schemas
import security
from functools import wraps
from pydantic import ValidationError

# 1. Configuración Inicial
app = Flask(__name__)
CORS(app) # Permite que el frontend se conecte

# Crear tablas al iniciar (Solo para desarrollo, idealmente usar migraciones)
Base.metadata.create_all(bind=engine)

# 2. Manejo de Sesión de DB
# Flask cierra la conexión automáticamente al terminar cada petición
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

# ==========================================
# 🔒 DECORADOR DE SEGURIDAD (El reemplazo de Depends)
# ==========================================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Buscar el token en los headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token es requerido'}), 401

        try:
            # Usamos tu función de security.py para leer el token
            payload = security.decode_access_token(token) # Asegúrate que esta funcion exista en security.py y devuelva el payload
            if payload is None:
                 return jsonify({'message': 'Token inválido o expirado'}), 401
            
            # Buscamos al usuario en la DB
            current_user = db_session.query(models.Usuario).filter_by(email=payload.get("sub")).first()
            if not current_user:
                return jsonify({'message': 'Usuario no encontrado'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token inválido', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# ==========================================
# 🏠 RUTAS DE COMUNIDADES
# ==========================================

@app.route("/comunidades", methods=['POST'])
@token_required
def create_comunidad(current_user):
    data = request.get_json()
    try:
        # 1. Validamos con Pydantic
        comunidad_schema = schemas.ComunidadCreate(**data)
        
        # 2. Creamos el modelo
        nueva_comunidad = models.Comunidad(
            **comunidad_schema.dict(),
            usuario_id=current_user.id # Usamos el usuario del token
        )
        
        db_session.add(nueva_comunidad)
        db_session.commit()
        
        # Flask no devuelve modelos directo, hay que convertirlos a dict/json
        return jsonify({
            "id": nueva_comunidad.id,
            "nombre": nueva_comunidad.nombre,
            "direccion": nueva_comunidad.direccion
        }), 200
        
    except ValidationError as e:
        return jsonify(e.errors()), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/comunidades", methods=['GET'])
@token_required
def read_comunidades(current_user):
    # Filtramos por el usuario dueño
    comunidades = db_session.query(models.Comunidad).filter(models.Comunidad.usuario_id == current_user.id).all()
    
    # Serializamos la lista manualmente (o podrías usar Marshmallow, pero esto es rápido)
    resultado = []
    for c in comunidades:
        resultado.append({
            "id": c.id, "nombre": c.nombre, "direccion": c.direccion, 
            "tipo": c.tipo, "unidades_totales": c.unidades_totales
        })
    return jsonify(resultado), 200

@app.route("/comunidades/<int:comunidad_id>", methods=['GET'])
def read_comunidad(comunidad_id):
    c = db_session.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if not c:
        return jsonify({"detail": "Comunidad no encontrada"}), 404
        
    return jsonify({
        "id": c.id, "nombre": c.nombre, "direccion": c.direccion,
        "tipo": c.tipo, "unidades_totales": c.unidades_totales
    }), 200

@app.route("/comunidades/<int:comunidad_id>", methods=['PUT'])
def update_comunidad(comunidad_id):
    db_comunidad = db_session.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if not db_comunidad:
        return jsonify({"detail": "Comunidad no encontrada"}), 404
    
    data = request.get_json()
    for key, value in data.items():
        if hasattr(db_comunidad, key):
            setattr(db_comunidad, key, value)
            
    db_session.commit()
    return jsonify({"message": "Comunidad actualizada", "id": db_comunidad.id}), 200

@app.route("/comunidades/<int:comunidad_id>", methods=['DELETE'])
def delete_comunidad(comunidad_id):
    db_comunidad = db_session.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if not db_comunidad:
        return jsonify({"detail": "Comunidad no encontrada"}), 404
        
    db_session.delete(db_comunidad)
    db_session.commit()
    return jsonify({"message": "Comunidad eliminada correctamente"}), 200

# ==========================================
# 👥 RUTAS DE RESIDENTES
# ==========================================

@app.route("/residentes/<int:comunidad_id>", methods=['POST'])
def create_residente(comunidad_id):
    # Validar comunidad
    existe = db_session.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if not existe:
        return jsonify({"detail": "La comunidad especificada no existe"}), 404

    data = request.get_json()
    try:
        # Validar datos
        residente_schema = schemas.ResidenteCreate(**data)
        
        res_dict = residente_schema.dict()
        res_dict['comunidad_id'] = comunidad_id
        
        nuevo_residente = models.Residente(**res_dict)
        db_session.add(nuevo_residente)
        db_session.commit()
        
        return jsonify({"id": nuevo_residente.id, "nombre": nuevo_residente.nombre}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/residentes", methods=['GET'])
def read_residentes():
    comunidad_id = request.args.get('comunidad_id') # Query param: ?comunidad_id=1
    query = db_session.query(models.Residente)
    
    if comunidad_id:
        query = query.filter(models.Residente.comunidad_id == comunidad_id)
        
    residentes = query.all()
    
    # Serializar respuesta
    lista = []
    for r in residentes:
        lista.append({
            "id": r.id, "nombre": r.nombre, "email": r.email, 
            "unidad": r.unidad, "estado_pago": r.estado_pago
        })
    return jsonify(lista), 200

@app.route("/residentes/<int:residente_id>", methods=['DELETE'])
def delete_residente(residente_id):
    res = db_session.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if not res:
        return jsonify({"detail": "Residente no encontrado"}), 404
    db_session.delete(res)
    db_session.commit()
    return jsonify({"message": "Residente eliminado"}), 200

# ==========================================
# 💰 RUTAS DE TRANSACCIONES
# ==========================================
# ✏️ ACTUALIZAR TRANSACCIÓN (PUT)
# ==========================================
@app.route("/transacciones/<int:transaccion_id>", methods=['PUT'])
def update_transaccion(transaccion_id):
    # 1. Buscar la transacción en la DB
    transaccion = db_session.query(models.Transaccion).filter(models.Transaccion.id == transaccion_id).first()
    
    if not transaccion:
        return jsonify({"detail": "Transacción no encontrada"}), 404

    # 2. Obtener los datos nuevos del JSON
    data = request.get_json()

    # 3. Actualizar campo por campo (si vienen en los datos)
    if 'descripcion' in data:
        transaccion.descripcion = data['descripcion']
    if 'monto' in data:
        transaccion.monto = data['monto']
    if 'tipo' in data:
        transaccion.tipo = data['tipo']
    if 'categoria' in data:
        transaccion.categoria = data['categoria']
    if 'fecha' in data:
        transaccion.fecha = data['fecha']

    # 4. Guardar cambios
    try:
        db_session.commit()
        return jsonify({"message": "Transacción actualizada", "id": transaccion.id}), 200
    except Exception as e:
        db_session.rollback()
        return jsonify({"detail": str(e)}), 500


# ==========================================
# 🗑️ ELIMINAR TRANSACCIÓN (DELETE)
# ==========================================
@app.route("/transacciones/<int:transaccion_id>", methods=['DELETE'])
def delete_transaccion(transaccion_id):
    # 1. Buscar la transacción
    transaccion = db_session.query(models.Transaccion).filter(models.Transaccion.id == transaccion_id).first()
    
    if not transaccion:
        return jsonify({"detail": "Transacción no encontrada"}), 404

    # 2. Borrar y confirmar
    try:
        db_session.delete(transaccion)
        db_session.commit()
        return jsonify({"message": "Transacción eliminada correctamente"}), 200
    except Exception as e:
        db_session.rollback()
        return jsonify({"detail": str(e)}), 500

@app.route("/transacciones", methods=['POST'])
def create_transaccion():
    data = request.get_json()
    try:
        schema = schemas.TransaccionCreate(**data)
        # Verificar comunidad
        if not db_session.query(models.Comunidad).filter(models.Comunidad.id == schema.comunidad_id).first():
            return jsonify({"detail": "Comunidad no encontrada"}), 404
            
        nueva = models.Transaccion(**schema.dict())
        db_session.add(nueva)
        db_session.commit()
        return jsonify({"id": nueva.id, "monto": nueva.monto, "tipo": nueva.tipo}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/transacciones/<int:comunidad_id>", methods=['GET'])
def read_transacciones_comunidad(comunidad_id):
    txs = db_session.query(models.Transaccion).filter(models.Transaccion.comunidad_id == comunidad_id).all()
    lista = [{"id": t.id, "monto": t.monto, "tipo": t.tipo, "descripcion": t.descripcion, "fecha": t.fecha.isoformat() if t.fecha else None} for t in txs]
    return jsonify(lista), 200

# ==========================================
# 📢 RUTAS DE ANUNCIOS
# ==========================================
@app.route("/anuncios", methods=['POST'])
def create_anuncio():
    data = request.get_json()
    try:
        schema = schemas.AnuncioCreate(**data)
        nuevo = models.Anuncio(**schema.dict())
        db_session.add(nuevo)
        db_session.commit()
        return jsonify({"id": nuevo.id, "titulo": nuevo.titulo}), 200
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/anuncios", methods=['GET'])
def read_anuncios():
    anuncios = db_session.query(models.Anuncio).all()
    lista = [{"id": a.id, "titulo": a.titulo, "mensaje": a.mensaje, "prioridad": a.prioridad} for a in anuncios]
    return jsonify(lista), 200

# ==========================================
# 🔑 AUTH & LOGIN
# ==========================================

@app.route("/register", methods=['POST'])
def register_user():
    data = request.get_json()
    try:
        # Validar esquema
        usuario_schema = schemas.UsuarioCreate(**data)
        
        # Verificar email
        if db_session.query(models.Usuario).filter(models.Usuario.email == usuario_schema.email).first():
            return jsonify({"detail": "Este email ya está registrado"}), 400
            
        # Hash Password
        hashed = security.get_password_hash(usuario_schema.password)
        
        nuevo_usuario = models.Usuario(
            nombre=usuario_schema.nombre,
            email=usuario_schema.email,
            password_hash=hashed,
            rol=usuario_schema.rol,
            comunidad_id=usuario_schema.comunidad_id
        )
        db_session.add(nuevo_usuario)
        db_session.commit()
        
        return jsonify({"id": nuevo_usuario.id, "email": nuevo_usuario.email}), 200
        
    except ValidationError as e:
        return jsonify(e.errors()), 400

@app.route("/token", methods=['POST'])
def login():
    # En Flask no usamos OAuth2PasswordRequestForm automágicamente
    # Esperamos un JSON con username y password
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
         # Soporte por si el frontend manda 'email' en vez de 'username'
         if 'email' in data:
             username = data['email']
         else:
             return jsonify({"detail": "Faltan credenciales"}), 400
    else:
        username = data['username']
        
    password = data['password']
    
    user = db_session.query(models.Usuario).filter(models.Usuario.email == username).first()
    
    if not user or not security.verify_password(password, user.password_hash):
        return jsonify({"detail": "Credenciales incorrectas"}), 401
        
    access_token = security.create_access_token(
        data={"sub": user.email, "id": user.id, "rol": user.rol}
    )
    
    return jsonify({"access_token": access_token, "token_type": "bearer"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)