from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import schemas
from database import get_db
from services import financiero_service
from security import obtener_usuario_actual

# 1. CAMBIO DE IMPORT: Cambiamos Cloudinary por tu nueva utilidad de Supabase
from utils.supabase_storage import subir_comprobante_supabase 

router = APIRouter(
    prefix="/api/finanzas",
    tags=["Finanzas y Pagos"]
)

@router.post("/transacciones")
def crear_movimiento(
    tipo: str = Form(...),
    monto_total: float = Form(...),
    metodo_pago: str = Form(...),
    descripcion: str = Form(None),
    categoria: str = Form(...),
    comunidad_id: int = Form(...),
    fecha: str = Form(None),
    propiedad_id: int = Form(None),
    archivo: UploadFile = File(None), # 👈 Aquí recibimos el binario
    db: Session = Depends(get_db)
):
    # 1. (Opcional) Aquí podrías guardar el archivo en disco o S3 y obtener una URL
    comprobante_url = None
    if archivo:
        # Por ahora solo simulamos la URL, pero el archivo ya llegó al servidor
        comprobante_url = f"uploads/{archivo.filename}"

    # 2. Llamamos al servicio pasando los datos sueltos
    return financiero_service.registrar_transaccion_y_pagar_cargos(
        db=db,
        tipo=tipo,
        monto_total=monto_total,
        metodo_pago=metodo_pago,
        descripcion=descripcion,
        categoria=categoria,
        comunidad_id=comunidad_id,
        fecha=fecha,
        propiedad_id=propiedad_id,
        comprobante_url=comprobante_url
    )



@router.post("/cargos", response_model=schemas.Cargo, status_code=201)
def emitir_cargo(
    cargo: schemas.CargoCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    return financiero_service.crear_cargo(db=db, cargo=cargo)

@router.post("/pagos", response_model=schemas.Transaccion, status_code=201)
def registrar_pago(
    transaccion: schemas.TransaccionCreate, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    return financiero_service.registrar_transaccion_y_pagar_cargos(db=db, transaccion=transaccion)

# --- 2. RUTAS DE LECTURA (GET) ---

@router.get("/comunidad/{comunidad_id}/transacciones", response_model=schemas.TransaccionesPaginadas)
def obtener_historial_financiero(
    comunidad_id: int,
    mes: Optional[int] = None,
    anio: Optional[int] = None,
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
    return financiero_service.obtener_balance_comunidad(db=db, comunidad_id=comunidad_id)

@router.get("/propiedades/{propiedad_id}/deudas", response_model=List[schemas.Cargo])
def ver_deudas_pendientes(
    propiedad_id: int,
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    return financiero_service.obtener_cargos_pendientes_por_propiedad(db=db, propiedad_id=propiedad_id)

@router.delete("/transacciones/{transaccion_id}", status_code=204)
def eliminar_movimiento(
    transaccion_id: int, 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    return financiero_service.eliminar_transaccion(db=db, transaccion_id=transaccion_id)