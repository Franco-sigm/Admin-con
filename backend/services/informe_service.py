from datetime import datetime
from sqlalchemy import extract
# Importa tus modelos
import models 

class InformeService:
    def __init__(self, db):
        self.db = db

    def obtener_datos_informe(self, datos: dict, usuario_id: int):
        """
        Obtiene los datos crudos y los retorna en un diccionario 
        listo para ser convertido a JSON.
        """
        tipo = datos.get('tipo')
        comunidad_id = datos.get('comunidad_id')
        mes = int(datos.get('mes', datetime.now().month))
        anio = int(datos.get('anio', datetime.now().year))

        resultado = {}

        # --- CASO 1: BALANCE FINANCIERO ---
        if tipo == 'balance_mensual':
            # 1. Buscamos transacciones (Igual que antes)
            movimientos = self.db.query(models.Transaccion).filter(
                models.Transaccion.comunidad_id == comunidad_id,
                extract('month', models.Transaccion.fecha) == mes,
                extract('year', models.Transaccion.fecha) == anio
            ).all()

            # 2. Cálculos (Backend sigue haciendo la matemática, es más seguro)
            ingresos = sum(m.monto for m in movimientos if m.tipo and m.tipo.lower() == 'ingreso')
            egresos = sum(m.monto for m in movimientos if m.tipo and m.tipo.lower() == 'egreso')
            total = ingresos - egresos

            # 3. SERIALIZACIÓN (El paso clave)
            # Convertimos los objetos de SQLAlchemy a diccionarios simples
            lista_movimientos = []
            for m in movimientos:
                lista_movimientos.append({
                    "id": m.id,
                    "descripcion": m.descripcion,
                    "monto": m.monto,
                    "fecha": m.fecha.strftime("%d-%m-%Y"), # Convertir fecha a texto
                    "tipo": m.tipo.capitalize() if m.tipo else "N/A"
                })

            # 4. Preparamos la respuesta
            resultado = {
                'tipo_informe': 'Balance Financiero',
                'periodo': f"{mes}/{anio}",
                'resumen': {
                    'total_ingresos': ingresos,
                    'total_egresos': egresos,
                    'balance_final': total
                },
                'detalles': lista_movimientos
            }

        # --- CASO 2: LISTA DE RESIDENTES ---
        elif tipo == 'lista_residentes':
            residentes = self.db.query(models.Residente).filter(
                models.Residente.comunidad_id == comunidad_id
            ).all()

            # Serialización de residentes
            lista_residentes = []
            for r in residentes:
                lista_residentes.append({
                    "id": r.id,
                    "nombre": r.nombre,
                    "email": r.email,
                    "unidad": r.unidad, # Depto o Casa
                    "telefono": r.telefono,
                    "estado_pago": r.estado_pago # 'AL_DIA' o 'MOROSO'
                })

            resultado = {
                'tipo_informe': 'Nómina de Residentes',
                'cantidad_total': len(residentes),
                'detalles': lista_residentes
            }

        else:
            raise ValueError("Tipo de informe no válido")

        # --- REGISTRO DE HISTORIAL (Opcional pero recomendado) ---
        # Guardamos que alguien pidió los datos, aunque el PDF se haga en el frontend
        try:
            nuevo_log = models.HistorialInforme(
                tipo=tipo,
                parametros=f"Consulta JSON - Mes: {mes}, Año: {anio}",
                usuario_id=usuario_id,
                fecha_generacion=datetime.now()
            )
            self.db.add(nuevo_log)
            self.db.commit()
        except Exception as e:
            print(f"Error guardando historial (no crítico): {e}")

        return resultado