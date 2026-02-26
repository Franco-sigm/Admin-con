from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import schemas
from database import get_db
from services import financiero_service
from security import obtener_usuario_actual

router = APIRouter(
    prefix="/api/finanzas",
    tags=["Finanzas y Pagos"]
)

# --- 1. RUTAS DE ESCRITURA (POST) ---

@router.post("/cargos", response_model=schemas.Cargo, status_code=201)
def emitir_cargo(
    cargo: schemas.CargoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Emite una nueva deuda a una propiedad específica."""
    return financiero_service.crear_cargo(db=db, cargo=cargo)

@router.post("/pagos", response_model=schemas.Transaccion, status_code=201)
def registrar_pago(
    transaccion: schemas.TransaccionCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Registra un pago y salda deudas pendientes (FIFO)."""
    return financiero_service.registrar_transaccion_y_pagar_cargos(db=db, transaccion=transaccion)

@router.post("/transacciones", response_model=schemas.Transaccion, status_code=201)
def crear_movimiento_general(
    transaccion: schemas.TransaccionCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Registra movimientos generales (especialmente EGRESOS)."""
    return financiero_service.crear_transaccion_general(db=db, transaccion=transaccion)


# --- 2. RUTAS DE LECTURA (GET) ---

@router.get("/comunidad/{comunidad_id}/transacciones", response_model=schemas.TransaccionesPaginadas)
def obtener_historial_financiero(
    comunidad_id: int,
    mes: int = None,
    anio: int = None,
    page: int = 1,
    limit: int = 15,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    return financiero_service.obtener_transacciones_comunidad(
        db=db, 
        comunidad_id=comunidad_id, 
        mes=mes, 
        anio=anio, 
        skip=skip, 
        limit=limit
    )

@router.get("/comunidad/{comunidad_id}/balance")
def obtener_resumen_financiero(
    comunidad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Trae el total de ingresos, egresos y balance para las tarjetas superiores."""
    return financiero_service.obtener_balance_comunidad(db=db, comunidad_id=comunidad_id)

@router.get("/propiedades/{propiedad_id}/deudas", response_model=List[schemas.Cargo])
def ver_deudas_pendientes(
    propiedad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Muestra las deudas actuales de un departamento antes de pagar."""
    return financiero_service.obtener_cargos_pendientes_por_propiedad(db=db, propiedad_id=propiedad_id)

@router.delete("/transacciones/{transaccion_id}", status_code=204)
def eliminar_movimiento(
    transaccion_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """
    Elimina físicamente una transacción de la base de datos.
    Ideal para corregir errores de digitación.
    """
    return financiero_service.eliminar_transaccion(db=db, transaccion_id=transaccion_id)

@router.get("/comunidad/{comunidad_id}/transacciones")
def listar_transacciones(
    comunidad_id: int,
    mes: int = None,
    anio: int = None,
    page: int = 1, # Por defecto la página 1
    limit: int = 20, # Por defecto 20 registros por página
    db: Session = Depends(get_db)
):
    # Matemáticas de paginación: Si estoy en pag 2 y el límite es 20, me salto (skip) los primeros 20.
    skip = (page - 1) * limit 
    return financiero_service.obtener_transacciones_comunidad(db, comunidad_id, mes, anio, skip, limit)