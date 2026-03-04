from sqlalchemy import func
try:
    from models import Residente, Transaccion
except ImportError:
    from backend.models import Residente, Transaccion


  # Ajusta el nombre del archivo si es diferente
class InformeService:
    
    @staticmethod
    def obtener_morosos_por_comunidad(db, comunidad_id):
        """
        Devuelve la lista de residentes cuyo estado de pago es 'MOROSO'.
        (Versión MVP: Basado en el campo estado_pago del modelo Residente)
        """
        try:
            resultados = db.query(Residente).filter(
                Residente.comunidad_id == comunidad_id,
                Residente.estado_pago == 'MOROSO'
            ).all()

            lista_morosos = []
            for r in resultados:
                lista_morosos.append({
                    "unidad": r.unidad,
                    "nombre_residente": r.nombre,
                    "telefono": r.telefono if r.telefono else "Sin registro",
                    "estado": r.estado_pago
                })
            return lista_morosos
        except Exception as e:
            print(f"Error al obtener morosos: {e}")
            raise e

    @staticmethod
    def obtener_balance_comunidad(db, comunidad_id):
        """
        Calcula el total de ingresos, egresos y el saldo actual de la comunidad.
        """
        try:
            # Sumar todos los INGRESOS
            total_ingresos = db.query(func.sum(Transaccion.monto)).filter(
                Transaccion.comunidad_id == comunidad_id,
                Transaccion.tipo == 'INGRESO'
            ).scalar() or 0  # scalar() devuelve el número, 'or 0' evita que sea None

            # Sumar todos los EGRESOS
            total_egresos = db.query(func.sum(Transaccion.monto)).filter(
                Transaccion.comunidad_id == comunidad_id,
                Transaccion.tipo == 'EGRESO'
            ).scalar() or 0

            # Calcular el Saldo
            saldo_actual = total_ingresos - total_egresos

            return {
                "total_ingresos": float(total_ingresos),
                "total_egresos": float(total_egresos),
                "saldo_actual": float(saldo_actual)
            }
        except Exception as e:
            print(f"Error al calcular el balance: {e}")
            raise e