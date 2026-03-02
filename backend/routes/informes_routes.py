from flask import Blueprint, request, jsonify, Flask
from security import token_required
from database import db_session
from services.informe_service import InformeService
from services import UsuarioService, ComunidadService, ResidenteService, TransaccionService
import schemas
from pydantic import ValidationError


informes_bp = Blueprint('informes', __name__)



#informes
# --- RUTA 1: Listado de Morosos ---
@informes_bp.route('/informes/morosidad', methods=['GET', 'OPTIONS'])
def reporte_morosidad():
    # 1. Atajar la petición fantasma (CORS)
    if request.method == 'OPTIONS':
        return '', 200

    comunidad_id = request.args.get('comunidad_id')
    if not comunidad_id:
        return jsonify({"error": "Falta el ID de la comunidad"}), 400

    try:
        # ⚠️ OJO AQUÍ: Asegúrate de que 'db.session' es como llamas a tu BD en main.py
        datos = InformeService.obtener_morosos_por_comunidad(db_session, comunidad_id)
        return jsonify(datos), 200
    except Exception as e:
        print(f"Error real en morosidad: {e}") # Esto imprimirá el error en la consola
        return jsonify({"error": "Error interno al generar reporte de morosos"}), 500


# --- RUTA 2: Balance Financiero ---
@informes_bp.route('/informes/balance', methods=['GET', 'OPTIONS'])
def reporte_balance():
    # 1. Atajar la petición fantasma (CORS)
    if request.method == 'OPTIONS':
        return '', 200

    comunidad_id = request.args.get('comunidad_id')
    if not comunidad_id:
        return jsonify({"error": "Falta el ID de la comunidad"}), 400

    try:
        datos = InformeService.obtener_balance_comunidad(db_session, comunidad_id)
        return jsonify(datos), 200
    except Exception as e:
        print(f"Error real en balance: {e}") 
        return jsonify({"error": "Error interno al generar el balance"}), 500