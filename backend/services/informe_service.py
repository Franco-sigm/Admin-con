from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from typing import List

def obtener_morosos_por_comunidad(db: Session, comunidad_id: int):
    """
    Busca todas las propiedades de una comunidad, suma sus cargos PENDIENTES o PARCIALES,
    pero RESTANDO los abonos (pagos) que ya hayan realizado.
    """
    # 1. Traemos todas las propiedades de esta comunidad
    propiedades = db.query(models.Propiedad).filter(
        models.Propiedad.comunidad_id == comunidad_id
    ).all()

    morosos = []

    for prop in propiedades:
        deuda_total_propiedad = 0
        
        # 2. Buscamos las deudas que no estén totalmente pagadas
        cargos_pendientes = db.query(models.Cargo).filter(
            models.Cargo.propiedad_id == prop.id,
            models.Cargo.estado.in_(["PENDIENTE", "PARCIAL"])
        ).all()
        
        for cargo in cargos_pendientes:
            # 3. LA MAGIA: Sumamos cuánto ha abonado históricamente a esta factura
            pagado = db.query(func.sum(models.DetallePago.monto_abonado)).filter(
                models.DetallePago.cargo_id == cargo.id
            ).scalar() or 0
            
            # 4. Calculamos el saldo real al vuelo
            saldo_real = cargo.monto - pagado
            deuda_total_propiedad += saldo_real
            
        # 5. Si después de los cálculos el depto sigue debiendo, entra a la lista
        if deuda_total_propiedad > 0:
            morosos.append({
                "numero_unidad": prop.numero_unidad,
                "deuda_total": float(deuda_total_propiedad)
            })
            
    # 6. Ordenamos la lista de mayor a menor deuda (Para el Top 5 del Dashboard)
    morosos.sort(key=lambda x: x["deuda_total"], reverse=True)
    
    return morosos

def obtener_balance_comunidad(db: Session, comunidad_id: int):
    """
    Calcula el dinero total que ha entrado (INGRESOS) y salido (EGRESOS)
    de una comunidad específica.
    """
    ingresos = db.query(func.sum(models.Transaccion.monto_total)).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "INGRESO"
    ).scalar() or 0.0

    egresos = db.query(func.sum(models.Transaccion.monto_total)).filter(
        models.Transaccion.comunidad_id == comunidad_id,
        models.Transaccion.tipo == "EGRESO"
    ).scalar() or 0.0

    balance_actual = float(ingresos) - float(egresos)

    return {
        "comunidad_id": comunidad_id,
        "ingresos": float(ingresos),       # 👈 Arreglado para coincidir con tu React
        "egresos": float(egresos),         # 👈 Arreglado para coincidir con tu React
        "balance_actual": balance_actual
    }