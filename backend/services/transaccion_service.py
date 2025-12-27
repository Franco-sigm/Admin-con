from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime, date
import models
import schemas

class TransaccionService:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, datos: schemas.TransaccionCreate) -> models.Transaccion:
        # Usamos model_dump para Pydantic v2 o dict para v1
        data_dict = datos.model_dump() if hasattr(datos, 'model_dump') else datos.dict()
        
        # Procesamiento de fecha para creación
        if isinstance(data_dict.get("fecha"), str):
            try:
                fecha_limpia = data_dict["fecha"].split('T')[0]
                data_dict["fecha"] = datetime.strptime(fecha_limpia, "%Y-%m-%d").date()
            except (ValueError, IndexError):
                data_dict["fecha"] = date.today()

        nueva = models.Transaccion(**data_dict)
        self.db.add(nueva)
        self.db.commit()
        self.db.refresh(nueva)
        return nueva

    def obtener_por_comunidad(self, comunidad_id: int) -> List[models.Transaccion]:
        return self.db.query(models.Transaccion)\
            .filter(models.Transaccion.comunidad_id == comunidad_id)\
            .order_by(desc(models.Transaccion.fecha))\
            .all()

    def obtener_por_id(self, transaccion_id: int) -> Optional[models.Transaccion]:
        return self.db.query(models.Transaccion).filter(models.Transaccion.id == transaccion_id).first()

    def actualizar(self, id: int, datos: schemas.TransaccionUpdate) -> Optional[models.Transaccion]:
        transaccion = self.obtener_por_id(id)
        if not transaccion:
            return None

        # Convertimos el esquema a diccionario ignorando los valores no enviados (Partial Update)
        update_data = datos.model_dump(exclude_unset=True) if hasattr(datos, 'model_dump') else datos.dict(exclude_unset=True)

        # Procesamiento de fechas (soporta ISO strings del Frontend)
        if "fecha" in update_data and update_data["fecha"]:
            if isinstance(update_data["fecha"], str):
                try:
                    fecha_limpia = update_data["fecha"].split('T')[0]
                    update_data["fecha"] = datetime.strptime(fecha_limpia, "%Y-%m-%d").date()
                except (ValueError, IndexError):
                    del update_data["fecha"]

        # Aplicación dinámica de cambios a la instancia del modelo
        for key, value in update_data.items():
            setattr(transaccion, key, value)

        try:
            self.db.commit()
            self.db.refresh(transaccion)
            return transaccion
        except Exception as e:
            self.db.rollback()
            raise e

    def eliminar(self, transaccion_id: int) -> bool:
        tx = self.obtener_por_id(transaccion_id)
        if tx:
            try:
                self.db.delete(tx)
                self.db.commit()
                return True
            except Exception as e:
                self.db.rollback()
                raise e
        return False