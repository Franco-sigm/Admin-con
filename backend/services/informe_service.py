from io import BytesIO
from xhtml2pdf import pisa
from flask import render_template
from datetime import datetime
from sqlalchemy import extract
# Importa tus modelos (ajusta la ruta según tu proyecto)
import models 

class InformeService:
    def __init__(self, db):
        self.db = db

    def generar_pdf(self, datos: dict, usuario_id: int):
        """
        Genera un PDF basado en los filtros recibidos del Frontend.
        """
        tipo = datos.get('tipo')
        comunidad_id = datos.get('comunidad_id') # RECIBIMOS EL ID AQUÍ
        mes = int(datos.get('mes', datetime.now().month))
        anio = int(datos.get('anio', datetime.now().year))

        contexto = {}

        # --- CASO 1: BALANCE FINANCIERO ---
        if tipo == 'balance_mensual':
            # Buscamos transacciones
            movimientos = self.db.query(models.Transaccion).filter(
                models.Transaccion.comunidad_id == comunidad_id,
                extract('month', models.Transaccion.fecha) == mes,
                extract('year', models.Transaccion.fecha) == anio
            ).all()

            # Cálculos (Mejorado para detectar mayúsculas/minúsculas)
            # .lower() convierte el texto de la BD a minúscula para comparar seguro
            ingresos = sum(m.monto for m in movimientos if m.tipo and m.tipo.lower() == 'ingreso')
            egresos = sum(m.monto for m in movimientos if m.tipo and m.tipo.lower() == 'egreso')
            
            total = ingresos - egresos

            # Formateo de moneda (Opcional: para que se vea bonito en el log)
            print(f"💰 Ingresos: {ingresos} | Egresos: {egresos} | Total: {total}")

            contexto = {
                'titulo': 'Balance Financiero Mensual',
                'movimientos': movimientos,
                'total': total, # <--- ¡Aquí va el número!
                'periodo': f"{mes}/{anio}",
                'fecha_emision': datetime.now().strftime("%d-%m-%Y")
            }
            template_name = 'informe_financiero.html'

        # --- CASO 2: LISTA DE RESIDENTES ---
        elif tipo == 'lista_residentes':
            residentes = self.db.query(models.Residente).filter(
                models.Residente.comunidad_id == comunidad_id
            ).all()

            contexto = {
                'titulo': 'Nómina de Residentes',
                'residentes': residentes,
                'fecha_emision': datetime.now().strftime("%d-%m-%Y")
            }
            template_name = 'informe_residentes.html' # Necesitarás crear este HTML tmb

        else:
            raise ValueError("Tipo de informe no válido")

        # --- GENERACIÓN DEL PDF ---
        # Renderizamos el HTML con los datos (Jinja2)
        html_content = render_template(template_name, **contexto)

        # Convertimos a PDF
        pdf_output = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_output)

        if pisa_status.err:
            raise Exception("Error crítico al renderizar PDF")

        # Guardamos log en historial (Auditoría)
        try:
            nuevo_log = models.HistorialInforme(
                tipo=tipo,
                parametros=f"Mes: {mes}, Año: {anio}",
                usuario_id=usuario_id,
                # Agrega comunidad_id si tu modelo Historial lo soporta (recomendado)
            )
            self.db.add(nuevo_log)
            self.db.commit()
        except Exception as e:
            print(f"Error guardando historial: {e}") 
            # No detenemos el PDF si falla el historial, pero lo logueamos

        pdf_output.seek(0)
        return pdf_output