import bcrypt

# Función para verificar contraseña
def verify_password(plain_password, hashed_password):
    # Convertimos a bytes si vienen como texto (MySQL a veces devuelve texto)
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    
    # bcrypt.checkpw devuelve True si coinciden
    return bcrypt.checkpw(plain_password, hashed_password)

# Función para encriptar contraseña
def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    
    # Generamos un 'salt' y hasheamos
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    
    # Devolvemos como string para poder guardarlo en la Base de Datos
    return hashed.decode('utf-8')