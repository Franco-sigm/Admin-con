from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
import security


# 1. Importamos la conexión a la DB archivos de estructura
from database import get_db
import models
import schemas

# 2.  Router (El mapa de rutas)
router = APIRouter()

# ==========================================
#  COMUNIDADES
# ==========================================

@router.post("/comunidades", response_model=schemas.Comunidad)
def create_comunidad(
    comunidad: schemas.ComunidadCreate, 
    db: Session = Depends(get_db),
    # 1. AGREGAMOS ESTO: Para saber quién está creando la comunidad
    current_user: models.Usuario = Depends(security.get_current_user) 
):
    # 2. CREAMOS EL MODELO MEZCLANDO DATOS
    # Usamos **comunidad.dict() para los datos del form
    # Y agregamos manualmente el usuario_id
    nueva_comunidad = models.Comunidad(
        **comunidad.dict(), 
        usuario_id=current_user.id  # <--- ¡LA PIEZA QUE FALTABA!
    )
    
    db.add(nueva_comunidad)
    db.commit()
    db.refresh(nueva_comunidad)
    
    return nueva_comunidad

@router.get("/comunidades", response_model=List[schemas.Comunidad])
def read_comunidades(
    db: Session = Depends(get_db),
    # 1. Obtenemos al usuario que está haciendo la petición
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # 2. Filtramos: "Trae las comunidades donde el dueño soy YO"
    comunidades = db.query(models.Comunidad)\
        .filter(models.Comunidad.usuario_id == current_user.id)\
        .all()
        
    return comunidades


@router.get("/comunidades/{comunidad_id}", response_model=schemas.Comunidad)
def read_comunidad(comunidad_id: int, db: Session = Depends(get_db)):
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")
    return db_comunidad

# actualizar comunidadij
@router.put("/comunidades/{comunidad_id}", response_model=schemas.Comunidad)
def update_comunidad(comunidad_id: int, comunidad: schemas.ComunidadCreate, db: Session = Depends(get_db)):
    # Buscamos la comunidad por ID
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    # Actualizamos los campos con los nuevos datos
    for key, value in comunidad.dict().items():
        setattr(db_comunidad, key, value)

    db.commit()
    db.refresh(db_comunidad)
    return db_comunidad

#borrar comunidad
@router.delete("/comunidades/{comunidad_id}")
def delete_comunidad(comunidad_id: int, db: Session = Depends(get_db)):
    # Buscamos la comunidad
    db_comunidad = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    
    if db_comunidad is None:
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    # La borramos
    db.delete(db_comunidad)
    db.commit()
    
    return {"message": "Comunidad eliminada correctamente"}

# ==========================================
#  RESIDENTES
# ==========================================

# 1. ACTUALIZAR (PUT)
@router.put("/residentes/{residente_id}", response_model=schemas.Residente)
def update_residente(residente_id: int, residente_actualizado: schemas.ResidenteCreate, db: Session = Depends(get_db)):
    db_residente = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if not db_residente:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    # Actualizamos los campos
    for key, value in residente_actualizado.dict().items():
        setattr(db_residente, key, value)

    db.commit()
    db.refresh(db_residente)
    return db_residente

# 2. ELIMINAR (DELETE)
@router.delete("/residentes/{residente_id}")
def delete_residente(residente_id: int, db: Session = Depends(get_db)):
    db_residente = db.query(models.Residente).filter(models.Residente.id == residente_id).first()
    if not db_residente:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    db.delete(db_residente)
    db.commit()
    return {"message": "Residente eliminado exitosamente"}

@router.post("/residentes/{comunidad_id}", response_model=schemas.Residente)
def create_residente(comunidad_id: int, residente: schemas.ResidenteCreate, db: Session = Depends(get_db)):
    
    # 1. Validación (esto déjalo igual)
    comunidad_existe = db.query(models.Comunidad).filter(models.Comunidad.id == comunidad_id).first()
    if not comunidad_existe:
        raise HTTPException(status_code=404, detail="La comunidad especificada no existe")

    # --- AQUÍ ESTÁ EL CAMBIO ---
    
    # 2. Convertimos el Pydantic a Diccionario
    residente_data = residente.dict()
    
    # 3. Forzamos el ID de la comunidad usando el de la URL
    # (Al asignarlo así, sobreescribimos el que venía del frontend si es que venía)
    residente_data['comunidad_id'] = comunidad_id

    # 4. Creamos el modelo pasando SOLO el diccionario
    nuevo_residente = models.Residente(**residente_data)
    
    # ---------------------------

    db.add(nuevo_residente)
    db.commit()
    db.refresh(nuevo_residente)
    return nuevo_residente



@router.get("/residentes", response_model=List[schemas.Residente])
def read_residentes(comunidad_id: int = None, db: Session = Depends(get_db)):
    # Iniciamos la consulta base
    query = db.query(models.Residente)
    
    # SI el frontend nos mandó un ID, filtramos por esa comunidad
    if comunidad_id:
        query = query.filter(models.Residente.comunidad_id == comunidad_id)
        
    # Devolvemos el resultado (filtrado o todos)
    return query.all()


# ==========================================
# Transacciones (Gastos / Ingresos)
# ==========================================

@router.post("/transacciones", response_model=schemas.Transaccion)
def create_transaccion(transaccion: schemas.TransaccionCreate, db: Session = Depends(get_db)):
    # Validación de comunidad
    if not db.query(models.Comunidad).filter(models.Comunidad.id == transaccion.comunidad_id).first():
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    nueva_transaccion = models.Transaccion(**transaccion.dict())
    db.add(nueva_transaccion)
    db.commit()
    db.refresh(nueva_transaccion)
    return nueva_transaccion

@router.get("/transacciones", response_model=List[schemas.Transaccion])
def read_transacciones(db: Session = Depends(get_db)):
    return db.query(models.Transaccion).all()

@router.get("/transacciones/{comunidad_id}", response_model=List[schemas.Transaccion])
def read_transacciones_por_comunidad(comunidad_id: int, db: Session = Depends(get_db)):
    transacciones = db.query(models.Transaccion).filter(models.Transaccion.comunidad_id == comunidad_id).all()
    return transacciones
# anunicos 

@router.post("/anuncios", response_model=schemas.Anuncio)
def create_anuncio(anuncio: schemas.AnuncioCreate, db: Session = Depends(get_db)):
    # Validación de comunidad
    if not db.query(models.Comunidad).filter(models.Comunidad.id == anuncio.comunidad_id).first():
        raise HTTPException(status_code=404, detail="Comunidad no encontrada")

    nuevo_anuncio = models.Anuncio(**anuncio.dict())
    db.add(nuevo_anuncio)
    db.commit()
    db.refresh(nuevo_anuncio)
    return nuevo_anuncio

@router.get("/anuncios", response_model=List[schemas.Anuncio])
def read_anuncios(db: Session = Depends(get_db)):
    return db.query(models.Anuncio).all()


# 1. REGISTRAR USUARIO (Crea un nuevo usuario en la DB)
@router.post("/register", response_model=schemas.Usuario)
def register_user(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # --- DIAGNÓSTICO (CHIVATO) ---
    print("--------------------------------------------------")
    print(f"INTENTANDO REGISTRAR A: {usuario.email}")
    print(f"LA CONTRASEÑA QUE LLEGÓ ES: '{usuario.password}'") 
    print(f"LARGO DE LA CONTRASEÑA: {len(usuario.password)}")
    print("--------------------------------------------------")
    # -----------------------------

    # A. Verificar si el email ya existe
    db_user = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    
    # B. Encriptar la contraseña
    hashed_password_generado = security.get_password_hash(usuario.password)
    
    # C. Crear el usuario
    nuevo_usuario = models.Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password_hash=hashed_password_generado, # <--- CORREGIDO: Usamos el nombre real de la DB
        rol=usuario.rol,
        comunidad_id=usuario.comunidad_id 
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario

# 2. LOGIN (Recibe email/pass y devuelve Token)
# En routes.py

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # A. Buscar usuario
    user = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    
    # B. Verificar contraseña
    # CORREGIDO: Cambiamos user.hashed_password por user.password_hash 👇
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # C. Generar Token
    access_token = security.create_access_token(
        data={"sub": user.email, "id": user.id, "rol": user.rol}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}