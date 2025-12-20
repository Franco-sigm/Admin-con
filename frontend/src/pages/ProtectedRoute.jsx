import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // 1. Buscamos la llave en el bolsillo
  const token = localStorage.getItem("token");

  // 2. Si NO hay token, lo mandamos afuera (al Login)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si SÍ hay token, le dejamos pasar a las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;