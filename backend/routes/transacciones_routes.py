from flask import Blueprint, request, jsonify, Flask
from security import token_required
from database import db_session
from services.comunidad_service import ComunidadService
from services import ComunidadService,TransaccionService
import schemas
from pydantic import ValidationError


transacciones_bp = Blueprint('transacciones', __name__)

# ==========================================
#  RUTAS DE TRANSACCIONES
# ==========================================

@transacciones_bp.route("/transacciones", methods=['POST'])
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

@transacciones_bp.route("/transacciones/<int:comunidad_id>", methods=['GET'])
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

@transacciones_bp.route("/transacciones/<int:transaccion_id>", methods=['PUT'])
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

@transacciones_bp.route("/transacciones/<int:id>", methods=['DELETE'])
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