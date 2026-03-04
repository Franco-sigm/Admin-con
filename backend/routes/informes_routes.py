print("🚀 CARGANDO EL ARCHIVO NUEVO DE INFORMES!")
from flask import Blueprint, request, jsonify
from database import db_session
import traceback

# EL TRUCO ESTILO FASTAPI: Importamos el archivo, no la clase
from services import informe_service

informes_bp = Blueprint('informes', __name__)

# --- RUTA 1: Listado de Morosos ---
@informes_bp.route('/informes/morosidad', methods=['GET', 'OPTIONS'])
def reporte_morosidad():
    if request.method == 'OPTIONS':
        return '', 200

    comunidad_id = request.args.get('comunidad_id')
    if not comunidad_id:
        return jsonify({"error": "Falta el ID de la comunidad"}), 400

    try:
        comunidad_id = int(comunidad_id)
        # LLAMAMOS A LA CLASE A TRAVÉS DEL MÓDULO (Adiós NameError)
        datos = informe_service.InformeService.obtener_morosos_por_comunidad(db_session, comunidad_id)
        return jsonify(datos), 200
    except Exception as e:
        print(f"❌ Error en morosidad: {e}")
        traceback.print_exc()
        return jsonify({"error": "Error interno al generar reporte"}), 500


# --- RUTA 2: Balance Financiero ---
@informes_bp.route('/informes/balance', methods=['GET', 'OPTIONS'])
def reporte_balance():
    if request.method == 'OPTIONS':
        return '', 200

    comunidad_id = request.args.get('comunidad_id')
    if not comunidad_id:
        return jsonify({"error": "Falta el ID de la comunidad"}), 400

    try:
        comunidad_id = int(comunidad_id)
        # LLAMAMOS A LA CLASE A TRAVÉS DEL MÓDULO
        datos = informe_service.InformeService.obtener_balance_comunidad(db_session, comunidad_id)
        return jsonify(datos), 200
    except Exception as e:
        print(f"❌ Error en balance: {e}") 
        traceback.print_exc()
        return jsonify({"error": "Error interno al generar el balance"}), 500