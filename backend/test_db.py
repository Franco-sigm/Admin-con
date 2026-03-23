from database import SessionLocal
import models

db = SessionLocal()
ultima = db.query(models.Transaccion).order_by(models.Transaccion.id.desc()).first()
print(f"ID de la última transacción en DB: {ultima.id}")
print(f"Concepto: {ultima.descripcion}")
db.close()