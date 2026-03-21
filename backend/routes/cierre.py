from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from security import obtener_usuario_actual
import schemas
from services import cierre_service

router = APIRouter(
    prefix="/api/cierre",
    tags=["Cierre Mensual"]
)

@router.post("/{comunidad_id}", response_model=schemas.CierreMensual)
async def ejecutar_cierre(
    comunidad_id: int,
    mes: int = Query(..., ge=1, le=12),
    anio: int = Query(..., ge=2024),
    db: Session = Depends(get_db),
    usuario_actual: schemas.Usuario = Depends(obtener_usuario_actual)
):
    """
    Endpoint Crítico: 
    Calcula el balance del mes, genera el registro de cierre y 
    crea los cargos automáticos para todas las propiedades.
    """
    
    # Seguridad: Solo permitimos a administradores realizar esta acción
    if usuario_actual.rol not in ["ADMIN", "SUPERADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes para realizar el cierre de mes."
        )

    try:
        # Ejecutamos la lógica pesada desde el servicio
        resultado = cierre_service.ejecutar_cierre_mensual(
            db=db,
            comunidad_id=comunidad_id,
            mes=mes,
            anio=anio,
            ejecutado_por_id=usuario_actual.id
        )
        return resultado

    except HTTPException as e:
        # Capturamos errores de lógica (ej: "Mes ya cerrado")
        raise e
    except Exception as e:
        # Error inesperado (Logueamos el error real para debugging)
        print(f"ERROR CRÍTICO EN CIERRE: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar el cierre. Contacte al soporte técnico."
        )