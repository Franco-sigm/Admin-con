from flask import Blueprint, request, jsonify, Flask
from security import token_required
from database import db_session
from services.comunidad_service import ComunidadService
import schemas
from pydantic import ValidationError


comunidades_bp = Blueprint('comunidades', __name__)

# ==========================================
# 🏠 RUTAS DE COMUNIDADES
# ==========================================

@comunidades_bp.route("/comunidades", methods=['POST'])
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

@comunidades_bp.route("/comunidades", methods=['GET'])
@token_required
def get_comunidades(current_user):
    service = ComunidadService(db_session)
    lista = service.obtener_por_usuario(current_user.id)
    return jsonify([
        {"id": c.id, "nombre": c.nombre, "direccion": c.direccion, "tipo": c.tipo, "unidades_totales": c.unidades_totales} 
        for c in lista
    ]), 200

@comunidades_bp.route("/comunidades/<int:id>", methods=['GET'])
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

@comunidades_bp.route("/comunidades/<int:id>", methods=['DELETE'])
@token_required
def delete_comunidad(current_user, id):
    service = ComunidadService(db_session)
    if service.eliminar(id, current_user.id):
        return jsonify({"message": "Eliminado correctamente"}), 200
    return jsonify({"detail": "No autorizado o no encontrado"}), 403

@comunidades_bp.route("/comunidades/<int:id>", methods=['PUT'])
@token_required
def update_comunidad(current_user, id):
    data = request.get_json()
    service = ComunidadService(db_session)
    comunidad_actualizada = service.actualizar(id, data, current_user.id)
    if comunidad_actualizada:
        return jsonify({"message": "Comunidad actualizada", "nombre": comunidad_actualizada.nombre}), 200
    return jsonify({"detail": "No autorizado o comunidad no encontrada"}), 403
