from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta # Añadimos date y timedelta
from models import Transaccion, CierreMensual, Propiedad, Cargo
from fastapi import HTTPException

def ejecutar_cierre_mensual(db: Session, comunidad_id: int, mes: int, anio: int, ejecutado_por_id: int):
    # 1. Verificar si ya existe un cierre para este periodo
    existe = db.query(CierreMensual).filter(
        CierreMensual.comunidad_id == comunidad_id,
        CierreMensual.mes == mes,
        CierreMensual.anio == anio
    ).first()
    
    if existe:
        raise HTTPException(status_code=400, detail="Este mes ya ha sido cerrado.")

    # 2. Calcular Totales del Mes (Ingresos y Egresos)
    totales = db.query(
        Transaccion.tipo,
        func.sum(Transaccion.monto_total).label("total")
    ).filter(
        Transaccion.comunidad_id == comunidad_id,
        func.extract('month', Transaccion.fecha) == mes,
        func.extract('year', Transaccion.fecha) == anio
    ).group_by(Transaccion.tipo).all()

    ingresos_val = 0.0
    egresos_val = 0.0

    for t in totales:
        if t.tipo == 'INGRESO':
            ingresos_val = float(t.total)
        elif t.tipo == 'EGRESO': # Usamos elif para mayor claridad
            egresos_val = float(t.total)

    # 3. Crear el registro de Cierre
    nuevo_cierre = CierreMensual(
        comunidad_id=comunidad_id,
        mes=mes,
        anio=anio,
        total_ingresos=ingresos_val,
        total_egresos=egresos_val,
        saldo_final=ingresos_val - egresos_val,
        cerrado_por_id=ejecutado_por_id
    )

    db.add(nuevo_cierre)
    
    # 4. PRORRATEO: Generar Cargos Automáticos
    propiedades = db.query(Propiedad).filter(Propiedad.comunidad_id == comunidad_id).all()
    
    if not propiedades:
        raise HTTPException(status_code=404, detail="No hay propiedades registradas en esta comunidad.")

    # Calculamos una fecha de vencimiento (ej: 10 días desde hoy)
    fecha_venc = date.today() + timedelta(days=10)

    for prop in propiedades:
        # Lógica de coeficiente
        coeficiente = float(prop.coeficiente) if prop.coeficiente else (1.0 / len(propiedades))
        monto_a_cobrar = egresos_val * coeficiente

        nuevo_cargo = Cargo(
            propiedad_id=prop.id,
            monto=int(round(monto_a_cobrar, 0)), # Convertimos a INT para pesos chilenos
            concepto=f"Gasto Común - {mes}/{anio}",
            fecha_emision=date.today(), # Usamos date.today() para coincidir con el tipo Date
            fecha_vencimiento=fecha_venc, # 👈 AGREGADO: Evita el error de nullable=False
            estado="PENDIENTE"
        )
        db.add(nuevo_cargo)

    try:
        db.commit()
        db.refresh(nuevo_cierre)
        return nuevo_cierre
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar el cierre: {str(e)}")