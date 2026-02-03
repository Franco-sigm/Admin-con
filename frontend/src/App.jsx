import { Routes, Route, Outlet, useParams, useLocation } from 'react-router-dom' 
import { useState, useEffect } from 'react'
import client from './api/client'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ResidentesPage from './pages/ResidentesPage'
import IngresosEgresosPage from './pages/IngresosEgresosPage'
import InformesPage from './pages/InformesPage'

// Componentes Globales
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// --- LAYOUT DEL DASHBOARD (Sidebar + Contenido) ---
const DashboardLayout = () => {
  const { id } = useParams(); // ID de la comunidad
  const [comunidad, setComunidad] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
        try {
            // Backend: GET /comunidades/5 (Ahora sí existe)
            const res = await client.get(`/comunidades/${id}`);
            setComunidad(res.data);
        } catch (error) {
            console.error("Error cargando info de comunidad", error);
        } finally {
            setCargando(false);
        }
    };
    if(id) fetchDatos();
  }, [id]);
  
  // Si está cargando, mostramos un spinner rápido o el esqueleto
  if (cargando) return <div className="flex h-screen items-center justify-center bg-gray-100">Cargando entorno...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. SIDEBAR (Izquierda) */}
      <Sidebar 
        comunidadId={id} 
        nombreComunidad={comunidad?.nombre || "Mi Comunidad"} 
        tipoComunidad={comunidad?.tipo}
      />
      
      {/* 2. CONTENIDO (Derecha) */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {/* Pasamos los datos de la comunidad a las páginas hijas por si los necesitan */}
        <Outlet context={{ comunidad }} /> 
      </div>
    </div>
  )
}

function App() {
  const location = useLocation();

  // Lógica: Ocultar Navbar en Login y Register
  const rutasSinNavbar = ["/login", "/register"];
  const mostrarNavbar = !rutasSinNavbar.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Renderizado Condicional del Navbar */}
      {mostrarNavbar && <Navbar />}

      <Routes>
        {/* =========================================
            ZONA PÚBLICA
           ========================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* =========================================
            ZONA PRIVADA (Protegida)
           ========================================= */}
        <Route element={<ProtectedRoute />}>
            
            {/* 1. SELECCIÓN DE COMUNIDAD (Home) */}
            <Route path="/home" element={<HomePage />} />

            {/* 2. GESTIÓN DE COMUNIDAD (Con Sidebar) */}
            <Route path="/comunidad/:id" element={<DashboardLayout />}>
               
               {/* Resumen Principal */}
               <Route index element={<DashboardPage />} />
               <Route path="dashboard" element={<DashboardPage />} />
               
               {/* Módulos */}
               <Route path="residentes" element={<ResidentesPage />} />
               <Route path="finanzas" element={<IngresosEgresosPage />} />
                <Route path="informes" element={<InformesPage />} />
               
              {/* Aquí agregarás más módulos en el futuro (Conserjería, Anuncios, etc.) */}
               
            </Route>

        </Route>

      </Routes>
    </div>
  )
}

export default App