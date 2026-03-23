from services.cargos_service import obtener_cargos_con_saldos_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import schemas, models
from database import get_db

router = APIRouter(
    prefix="/api/cargos",
    tags=["Administración de Cargos"]
)

@router.get("/propiedad/{propiedad_id}")
def get_cargos_unidad(propiedad_id: int, db: Session = Depends(get_db)):
    # Simplemente le pedimos al servicio que haga el trabajo
    return obtener_cargos_con_saldos_db(db, propiedad_id)

# 2. Crear un nuevo cargo
@router.post("", response_model=schemas.Cargo)
def crear_cargo(cargo: schemas.CargoCreate, db: Session = Depends(get_db)):
    propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == cargo.propiedad_id).first()
    if not propiedad:
        raise HTTPException(status_code=404, detail="La propiedad no existe")
        
    nuevo_cargo = models.Cargo(**cargo.model_dump())
    nuevo_cargo.estado = 'PENDIENTE' # Forzamos estado inicial
    
    db.add(nuevo_cargo)
    db.commit()
    db.refresh(nuevo_cargo)
    return nuevo_cargo

# 3. Actualizar o Anular
@router.put("/{cargo_id}")
def actualizar_o_anular_cargo(cargo_id: int, datos: schemas.CargoUpdate, db: Session = Depends(get_db)):
    cargo = db.query(models.Cargo).filter(models.Cargo.id == cargo_id).first()
    
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    
    # Si el usuario quiere ANULAR, lo permitimos siempre que no sea PAGADO
    if datos.estado == 'ANULADO':
        if cargo.estado == 'PAGADO':
            raise HTTPException(status_code=400, detail="No se puede anular un cargo ya pagado")
        cargo.estado = 'ANULADO'
    else:
        # Si es edición normal, bloqueamos si ya tiene movimientos financieros
        if cargo.estado in ['PAGADO', 'PARCIAL']:
             raise HTTPException(status_code=400, detail="No puedes editar montos de un cargo con pagos parciales")
        
        for key, value in datos.model_dump(exclude_unset=True).items():
            setattr(cargo, key, value)
    
    db.commit()
    db.refresh(cargo)
    return cargo