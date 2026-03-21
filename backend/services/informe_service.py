from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
from sqlalchemy import func

def obtener_datos_reportes(db: Session, comunidad_id: int):
    # 1. Definimos las fechas
    hoy = datetime.now()
    # Retrocedemos unos 180 días (6 meses aprox) para el historial
    fecha_inicio = hoy - timedelta(days=180)
    mes_actual_num = hoy.month
    anio_actual = hoy.year

    # Diccionario para traducir los meses al español
    nombres_meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    # 2. Traemos TODAS las transacciones de los últimos 6 meses de un solo golpe
    transacciones = db.query(models.Transaccion).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.fecha >= fecha_inicio
    ).all()

    # --- LÓGICA DEL GRÁFICO DE BARRAS (Historial) ---
    historial_dict = {}
    
    # --- LÓGICA DEL GRÁFICO DE TORTA (Desglose del mes actual) ---
    desglose_dict = {}

    for t in transacciones:
        # Obtenemos el nombre corto del mes (Ej: "Oct")
        nombre_mes = nombres_meses[t.fecha.month - 1]
        llave_mes = f"{t.fecha.year}-{t.fecha.month:02d}" # Ej: "2026-02" para ordenar correctamente

        # 3A. Llenamos el historial
        if llave_mes not in historial_dict:
            historial_dict[llave_mes] = {"mes": nombre_mes, "ingresos": 0, "egresos": 0, "orden": llave_mes}
        
        if t.tipo.upper() == "INGRESO":
            historial_dict[llave_mes]["ingresos"] += float(t.monto_total)
        elif t.tipo.upper() == "EGRESO":
            historial_dict[llave_mes]["egresos"] += float(t.monto_total)

            # 3B. Si es un egreso y es del mes actual, lo sumamos a la torta de categorías
            if t.fecha.month == mes_actual_num and t.fecha.year == anio_actual:
                # Si no tienes un campo "categoria", puedes usar "descripcion"
                categoria = t.categoria if hasattr(t, 'categoria') and t.categoria else "Otros"
                
                if categoria not in desglose_dict:
                    desglose_dict[categoria] = 0
                desglose_dict[categoria] += float(t.monto_total)

    # 4. Ordenamos el historial cronológicamente y le quitamos la llave de ordenamiento
    historial_lista = sorted(historial_dict.values(), key=lambda x: x["orden"])
    for item in historial_lista:
        del item["orden"] # Limpiamos la basura, a React no le sirve esto

    # 5. Formateamos el desglose para el PieChart de Recharts {name: "Luz", value: 100}
    desglose_lista = [{"name": cat, "value": total} for cat, total in desglose_dict.items()]

    return {
        "historial": historial_lista,
        "desglose": desglose_lista
    }

def obtener_morosos_por_comunidad(db: Session, comunidad_id: int):
    # Traemos todas las propiedades de la comunidad
    propiedades = db.query(models.Propiedad).filter(models.Propiedad.comunidad_id == comunidad_id).all()
    
    morosos = []
    for prop in propiedades:
        # Sumamos todos los cargos pendientes de esta propiedad
        deuda_total = db.query(models.Cargo).filter(
            models.Cargo.propiedad_id == prop.id,
            models.Cargo.estado != 'PAGADO'  # Solo consideramos los cargos que no están pagados
        ).with_entities(func.sum(models.Cargo.monto)).scalar() or 0
        
        if deuda_total > 0:
            morosos.append({
                "numero_unidad": prop.numero_unidad,
                "deuda_total": deuda_total
            })
    
    return morosos

def obtener_balance_comunidad(db: Session, comunidad_id: int):
    ingresos = db.query(models.Transaccion).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "INGRESO"
    ).with_entities(func.sum(models.Transaccion.monto_total)).scalar() or 0

    egresos = db.query(models.Transaccion).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "EGRESO"
    ).with_entities(func.sum(models.Transaccion.monto_total)).scalar() or 0

    return {
        "ingresos": float(ingresos),
        "egresos": float(egresos),
        "balance": float(ingresos) - float(egresos)
    }