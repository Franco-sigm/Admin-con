from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func # 👈 IMPORTANTE: Agregamos func para poder sumar
from typing import List
import schemas
from database import get_db
import models
import security
from security import obtener_usuario_actual

router = APIRouter(
    prefix="/api/cargos",
    tags=["Administración de Cargos"]
)

# 1. Obtener todos los cargos de una propiedad específica (AHORA CON SALDO REAL)
@router.get("/propiedad/{propiedad_id}", response_model=List[schemas.Cargo])
def obtener_cargos_por_propiedad(propiedad_id: int, db: Session = Depends(get_db)):
    # Buscamos los cargos de esta propiedad
    cargos = db.query(models.Cargo).filter(models.Cargo.propiedad_id == propiedad_id).all()
    
    resultados_para_react = []
    
    for cargo in cargos:
        # Sumamos todos los abonos (pagos parciales) que se han hecho a esta deuda
        pagado = db.query(func.sum(models.DetallePago.monto_abonado)).filter(
            models.DetallePago.cargo_id == cargo.id
        ).scalar() or 0
        
        # Calculamos el saldo real (ej: 300000 - 160000 = 140000)
        saldo_real = cargo.monto - pagado
        
        # Le enviamos a React el diccionario con el saldo actualizado
        resultados_para_react.append({
            "id": cargo.id,
            "monto": saldo_real, # ¡Aquí React recibe el monto descontado!
            "concepto": cargo.concepto,
            "fecha_emision": cargo.fecha_emision,
            "fecha_vencimiento": cargo.fecha_vencimiento,
            "estado": cargo.estado,
            "propiedad_id": cargo.propiedad_id
        })
        
    return resultados_para_react

# 2. Crear un nuevo cargo (Ej: Gasto Común, Multa)
@router.post("", response_model=schemas.Cargo)
def crear_cargo(cargo: schemas.CargoCreate, db: Session = Depends(get_db)):
    # Verificamos que la propiedad exista
    propiedad = db.query(models.Propiedad).filter(models.Propiedad.id == cargo.propiedad_id).first()
    if not propiedad:
        raise HTTPException(status_code=404, detail="La propiedad no existe")
        
    nuevo_cargo = models.Cargo(**cargo.model_dump())
    db.add(nuevo_cargo)
    db.commit()
    db.refresh(nuevo_cargo)
    return nuevo_cargo

@router.put("/{cargo_id}", response_model=schemas.Cargo)
def actualizar_o_anular_cargo(cargo_id: int, datos: schemas.CargoCreate, db: Session = Depends(get_db)):
    cargo = db.query(models.Cargo).filter(models.Cargo.id == cargo_id).first()
    
    if not cargo:
        raise HTTPException(status_code=404, detail="Cargo no encontrado")
    
    # REGLA DE ORO: Si ya tiene pagos, no se toca
    if cargo.estado in ['PAGADO', 'PARCIAL']:
        raise HTTPException(status_code=400, detail="No puedes modificar un cargo que ya tiene pagos asociados")

    # Actualizamos los campos
    for key, value in datos.model_dump().items():
        setattr(cargo, key, value)
    
    db.commit()
    db.refresh(cargo)
    return cargo