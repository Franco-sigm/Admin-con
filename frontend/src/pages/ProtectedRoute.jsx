import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const location = useLocation(); // Hook para saber en qué URL está intentando entrar

  // 1. Validación: ¿Existe el token?
  if (!token) {
    // Redirigir al Login.
    // TRUCO PRO: Pasamos "state={{ from: location }}"
    // Así, si en el futuro mejora el Login, podré redirigirlo 
    // a la página exacta donde quería ir, en vez de siempre al Home.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Validación Extra (Opcional pero recomendada):
  // Un token JWT real tiene 3 partes separadas por puntos (header.payload.signature).
  // Si el usuario puso "texto-basura" en el localStorage, lo sacamos de una vez.
  if (token.split('.').length !== 3) {
     localStorage.removeItem("token");
     return <Navigate to="/login" replace />;
  }

  // 3. Todo OK, renderizar la ruta hija
  return <Outlet />;
};

export default ProtectedRoute;