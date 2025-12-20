import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verificamos si existe la llave en el bolsillo del navegador
  const token = localStorage.getItem('token');

  if (!token) {
    // 🛑 ¡ALTO! No hay token, fuera de aquí.
    return <Navigate to="/login" replace />;
  }

  // ✅ Pase usted. Renderiza las rutas hijas (Outlet).
  return <Outlet />;
};

export default ProtectedRoute;