import calendar  # 👈 Faltaba para calcular los días del mes
from datetime import datetime, timedelta
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

import schemas
from database import get_db
from models import Transaccion
from security import obtener_usuario_actual
from services import informe_service

router = APIRouter(
    prefix="/api/informes",
    tags=["Reportes e Informes"]
)

@router.get("/comunidad/{comunidad_id}/reportes")
def obtener_reportes_financieros(
    comunidad_id: int, 
    periodo: str = Query("6meses"), 
    db: Session = Depends(get_db)
):
    # Usamos datetime.now() para tener acceso a .day, .month, etc.
    hoy = datetime.now()
    MESES_NOM = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    historial_dict = {}
    label_key = "mes" 

    # --- A. ESTRUCTURA DE TIEMPO ---
    if periodo == "mensual":
        label_key = "fecha"
        ultimo_dia = calendar.monthrange(hoy.year, hoy.month)[1]
        fecha_inicio = hoy.replace(day=1, hour=0, minute=0, second=0)
        for d in range(1, ultimo_dia + 1):
            lbl = f"Día {d}"
            historial_dict[lbl] = {label_key: lbl, "ingresos": 0, "egresos": 0}
            
    elif periodo == "anual":
        fecha_inicio = hoy.replace(month=1, day=1, hour=0, minute=0, second=0)
        for m in range(1, 13):
            lbl = MESES_NOM[m-1]
            historial_dict[lbl] = {label_key: lbl, "ingresos": 0, "egresos": 0}
            
    else: # 6meses
        fecha_inicio = (hoy - timedelta(days=180)).replace(hour=0, minute=0, second=0)
        for i in range(5, -1, -1):
            # Calculamos los nombres de los últimos 6 meses
            aux = hoy.month - i
            idx = (aux - 1) % 12
            lbl = MESES_NOM[idx]
            historial_dict[lbl] = {label_key: lbl, "ingresos": 0, "egresos": 0}

    # --- B. CONSULTA EGRESOS (Dona) ---
    egresos_raw = db.query(
        Transaccion.categoria, 
        func.sum(Transaccion.monto_total).label("total")
    ).filter(
        Transaccion.comunidad_id == comunidad_id,
        Transaccion.tipo == 'EGRESO',
        Transaccion.fecha >= fecha_inicio
    ).group_by(Transaccion.categoria).all()

    desglose = [{"name": e.categoria or "Otros", "value": int(e.total)} for e in egresos_raw]

    # --- C. CONSULTA HISTORIAL (Barras) ---
    agrupar_por = func.day(Transaccion.fecha) if periodo == "mensual" else func.month(Transaccion.fecha)

    query_db = db.query(
        agrupar_por.label("unidad"),
        Transaccion.tipo,
        func.sum(Transaccion.monto_total).label("total")
    ).filter(
        Transaccion.comunidad_id == comunidad_id,
        Transaccion.fecha >= fecha_inicio
    ).group_by("unidad", Transaccion.tipo).all()

    # --- D. FUSIONAR DATOS ---
    for item in query_db:
        if periodo == "mensual":
            lbl = f"Día {int(item.unidad)}"
        else:
            lbl = MESES_NOM[int(item.unidad) - 1]
            
        if lbl in historial_dict:
            if item.tipo == 'INGRESO':
                historial_dict[lbl]["ingresos"] = int(item.total)
            else:
                historial_dict[lbl]["egresos"] = int(item.total)

    return {
        "desglose": desglose,
        "historial": list(historial_dict.values())
    }

# --- RUTAS DE APOYO ---

@router.get("/comunidad/{comunidad_id}/morosos", response_model=List[Dict[str, Any]])
def reporte_morosos(comunidad_id: int, db: Session = Depends(get_db), usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)):
    return informe_service.obtener_morosos_por_comunidad(db=db, comunidad_id=comunidad_id)

@router.get("/comunidad/{comunidad_id}/balance", response_model=Dict[str, Any])
def reporte_balance(comunidad_id: int, db: Session = Depends(get_db), usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)):
    return informe_service.obtener_balance_comunidad(db=db, comunidad_id=comunidad_id)