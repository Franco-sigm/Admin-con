from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services import financiero_service
from security import obtener_usuario_actual

router = APIRouter(
    prefix="/api/finanzas",
    tags=["Finanzas y Pagos"]
)

@router.post("/cargos", response_model=schemas.Cargo, status_code=201)
def emitir_cargo(
    cargo: schemas.CargoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Emite una nueva deuda (Gasto común, Multa, etc.) a una propiedad específica.
    """
    return financiero_service.crear_cargo(db=db, cargo=cargo)

@router.post("/pagos", response_model=schemas.Transaccion, status_code=201)
def registrar_pago(
    transaccion: schemas.TransaccionCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Registra el ingreso de dinero y automáticamente reparte el monto 
    para saldar las deudas pendientes más antiguas de esa propiedad (Lógica FIFO).
    """
    return financiero_service.registrar_transaccion_y_pagar_cargos(db=db, transaccion=transaccion)

@router.get("/propiedades/{propiedad_id}/deudas", response_model=List[schemas.Cargo])
def ver_deudas_pendientes(
    propiedad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual) # 🔒 Ruta protegida
):
    """
    Muestra las deudas actuales de un departamento (ideal para mostrar en el frontend antes de pagar).
    """
    return financiero_service.obtener_cargos_pendientes_por_propiedad(db=db, propiedad_id=propiedad_id)