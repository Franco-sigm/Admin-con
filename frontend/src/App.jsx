import { Routes, Route, Outlet, useParams, useLocation } from 'react-dom/client' // Ojo: Verifica si usas react-router-dom aquí. Normalmente es 'react-router-dom'
import { Routes as RoutesRR, Route as RouteRR, Outlet as OutletRR, useParams as useParamsRR, useLocation as useLocationRR } from 'react-router-dom' 
// Nota: Dejé el import correcto de react-router-dom abajo para evitar conflictos
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
import CargosPage from './pages/CargosPage'
import InformesPage from './pages/InformesPage'
import PropiedadesPage from './pages/PropiedadesPage' 
import ReportesPage from './pages/ReportesPage'


 
// Componentes Globales
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// --- LAYOUT DEL DASHBOARD (Sidebar + Contenido) ---
const DashboardLayout = () => {
  const { id } = useParamsRR(); // ID de la comunidad
  const [comunidad, setComunidad] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
        try {
            // 1. Buscamos el token
            const token = localStorage.getItem('token');
            const config = {
              headers: { Authorization: `Bearer ${token}` }
            };

            // 2. Usamos /api y enviamos la credencial
            const res = await client.get(`/api/comunidades/${id}`, config);
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
        <OutletRR context={{ comunidad }} /> 
      </div>
    </div>
  )
}

function App() {
  const location = useLocationRR();

  // Lógica: Ocultar Navbar en Login y Register
  const rutasSinNavbar = ["/login", "/register"];
  const mostrarNavbar = !rutasSinNavbar.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Renderizado Condicional del Navbar */}
      {mostrarNavbar && <Navbar />}

      <RoutesRR>
        {/* =========================================
            ZONA PÚBLICA
           ========================================= */}
        <RouteRR path="/" element={<LandingPage />} />
        <RouteRR path="/login" element={<LoginPage />} />
        <RouteRR path="/register" element={<RegisterPage />} />

        {/* =========================================
            ZONA PRIVADA (Protegida)
           ========================================= */}
        <RouteRR element={<ProtectedRoute />}>
            
            {/* 1. SELECCIÓN DE COMUNIDAD (Home) */}
            <RouteRR path="/home" element={<HomePage />} />

            {/* 2. GESTIÓN DE COMUNIDAD (Con Sidebar) */}
            <RouteRR path="/comunidad/:id" element={<DashboardLayout />}>
               
               {/* Resumen Principal */}
               <RouteRR index element={<DashboardPage />} />
               <RouteRR path="dashboard" element={<DashboardPage />} />
               
               {/* Módulos */}
               <RouteRR path="residentes" element={<ResidentesPage />} />
               <RouteRR path="propiedades" element={<PropiedadesPage />} />
               <RouteRR path="finanzas" element={<IngresosEgresosPage />} />
               <RouteRR path="cargos" element={<CargosPage />} />
               <RouteRR path="informes" element={<InformesPage />} /> 
               <RouteRR path="reportes" element={<ReportesPage />} />
              
               
              {/* Aquí agregarás más módulos en el futuro (Conserjería, Anuncios, etc.) */}
               
            </RouteRR>

        </RouteRR>

      </RoutesRR>
    </div>
  )
}

export default App