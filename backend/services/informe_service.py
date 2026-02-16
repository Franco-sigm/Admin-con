from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from typing import List

def obtener_morosos_por_comunidad(db: Session, comunidad_id: int):
    """
    Busca todas las propiedades de una comunidad y suma los cargos
    que están en estado PENDIENTE o PARCIAL.
    """
    resultados = (
        db.query(
            models.Propiedad.numero_unidad,
            # 👇 CAMBIO 1: Usamos models.Cargo.monto
            func.sum(models.Cargo.monto).label('deuda_total')
        )
        .join(models.Cargo, models.Propiedad.id == models.Cargo.propiedad_id)
        .filter(models.Propiedad.comunidad_id == comunidad_id)
        .filter(models.Cargo.estado.in_(["PENDIENTE", "PARCIAL"]))
        .group_by(models.Propiedad.id)
        # 👇 CAMBIO 2: Usamos models.Cargo.monto aquí también
        .having(func.sum(models.Cargo.monto) > 0)
        .all()
    )

    morosos = []
    for unidad, deuda in resultados:
        morosos.append({
            "numero_unidad": unidad,
            "deuda_total": float(deuda) 
        })
        
    return morosos
def obtener_balance_comunidad(db: Session, comunidad_id: int):
    """
    Calcula el dinero total que ha entrado (INGRESOS) y salido (EGRESOS)
    de una comunidad específica.
    """
    # 1. Cambiamos models.Transaccion.monto por models.Transaccion.monto_total
    ingresos = db.query(func.sum(models.Transaccion.monto_total)).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "INGRESO"
    ).scalar() or 0.0

    # 2. Aquí también hacemos el mismo cambio
    egresos = db.query(func.sum(models.Transaccion.monto_total)).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "EGRESO"
    ).scalar() or 0.0

    balance_actual = float(ingresos) - float(egresos)

    return {
        "comunidad_id": comunidad_id,
        "total_ingresos": float(ingresos),
        "total_egresos": float(egresos),
        "balance_actual": balance_actual
    }