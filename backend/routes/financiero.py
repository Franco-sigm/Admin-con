from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import schemas
from database import get_db
from services import financiero_service
from security import obtener_usuario_actual
from utils.cloudinary import subir_comprobante_cloudinary 

# Definimos el router UNA SOLA VEZ
router = APIRouter(
    prefix="/api/finanzas",
    tags=["Finanzas y Pagos"]
)

# --- 1. RUTAS DE ESCRITURA (POST) ---

@router.post("/transacciones", response_model=schemas.Transaccion, status_code=201)
async def crear_movimiento_general(
    comunidad_id: int = Form(...),
    tipo: str = Form(...), 
    monto_total: float = Form(...), 
    metodo_pago: str = Form(...),
    fecha: str = Form(...),
    descripcion: Optional[str] = Form(None),
    categoria: Optional[str] = Form("Otros"),
    propiedad_id: Optional[int] = Form(None),
    archivo: Optional[UploadFile] = File(None), 
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """Registra movimientos con soporte para comprobantes (Imágenes y PDF)."""
    
    url_comprobante = None
    
    if archivo:
        formatos_validos = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
        if archivo.content_type not in formatos_validos:
            raise HTTPException(
                status_code=400, 
                detail=f"Archivo no permitido. Solo JPG, PNG y PDF. Recibido: {archivo.content_type}"
            )

        url_comprobante = subir_comprobante_cloudinary(archivo)
        
        if not url_comprobante:
            raise HTTPException(
                status_code=500, 
                detail="Error al subir el archivo a Cloudinary."
            )

    return financiero_service.crear_transaccion_general(
        db=db, 
        comunidad_id=comunidad_id,
        tipo=tipo,
        monto_total=monto_total,
        metodo_pago=metodo_pago,
        fecha=fecha,
        descripcion=descripcion,
        categoria=categoria,
        propiedad_id=propiedad_id,
        comprobante_url=url_comprobante
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