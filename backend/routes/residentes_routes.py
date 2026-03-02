from flask import Blueprint, request, jsonify, Flask
from security import token_required
from database import db_session
from services.comunidad_service import ComunidadService
from services.residente_service import ResidenteService
import schemas
from pydantic import ValidationError


residentes_bp = Blueprint('residentes', __name__)


# ==========================================
# 👥 RUTAS DE RESIDENTES
# ==========================================
@residentes_bp.route("/residentes", methods=['POST'])
@token_required
def create_residente(current_user):
    data = request.get_json()
    com_service = ComunidadService(db_session)
    res_service = ResidenteService(db_session)
    
    try:
        schema = schemas.ResidenteCreate(**data)
        
        # Validar permisos
        if not com_service.validar_propiedad(schema.comunidad_id, current_user.id):
            return jsonify({"detail": "No tienes permiso en esta comunidad"}), 403
            
        # Crear residente
        nuevo = res_service.crear(schema)
        return jsonify({"id": nuevo.id, "nombre": nuevo.nombre}), 200
        
    except ValidationError as e:
        # Error de Pydantic (ej: faltan datos o el formato del correo está mal)
        return jsonify(e.errors()), 400
        
    except IntegrityError as e:
        # 🌟 2. CAPTURA DE DUPLICADOS EN LA BASE DE DATOS
        db_session.rollback()  # ¡Crucial! Deshace la transacción para que Flask no se cuelgue
        
        error_msg = str(e.orig).lower()
        
        # Revisamos qué candado saltó para dar un mensaje exacto
        if "uq_comunidad_unidad" in error_msg:
            return jsonify({"detail": "Esta unidad ya tiene un residente asignado en esta comunidad."}), 400
        else:
            return jsonify({"detail": "Error de duplicidad en la base de datos."}), 400

@residentes_bp.route("/residentes", methods=['GET'])
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
@residentes_bp.route("/residentes/<int:id>", methods=['GET'])
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

@residentes_bp.route("/residentes/<int:id>", methods=['DELETE'])
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

@residentes_bp.route("/residentes/<int:id>", methods=['PUT'])
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
