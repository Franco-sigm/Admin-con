import { Routes, Route, Outlet, useParams } from 'react-router-dom' // <--- Agregamos Outlet y useParams
import { useState, useEffect } from 'react' // <--- Agregamos los hooks
import client from './api/client' // <--- Importamos el cliente Axios
import ProtectedRoute from './components/ProtectedRoute'

// Páginas
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage' // Asegúrate que el nombre coincida con tu archivo
import RegisterPage from './pages/RegisterPage' // <--- ¡NUEVA!
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar' // <--- Importante importar el Sidebar
import ResidentesPage from './pages/ResidentesPage'
import IngresosEgresosPage from './pages/IngresosEgresosPage'

// --- LAYOUT INTERNO (Definido aquí mismo para facilitar) ---
const DashboardLayout = () => {
  const { id } = useParams(); // Captura el ID de la URL (ej: 55)
  const [comunidad, setComunidad] = useState(null);

  useEffect(() => {
    // Pedimos los datos de la comunidad para mostrarlos en el Sidebar
    const fetchDatos = async () => {
        try {
            const res = await client.get(`/comunidades/${id}`); // Asegúrate que esta ruta exista en backend
            setComunidad(res.data);
        } catch (error) {
            console.error("Error cargando comunidad", error);
        }
    };
    if(id) fetchDatos();
  }, [id]);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 1. SIDEBAR (Izquierda) */}
      <Sidebar 
        comunidadId={id} 
        nombreComunidad={comunidad?.nombre || "Cargando..."} 
      />
      
      {/* 2. CONTENIDO (Derecha) */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        {/* Aquí se inyectan las rutas hijas (DashboardPage, Residentes, etc) */}
        <Outlet context={{ comunidad }} /> 
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* OJO: El Navbar global sale en TODAS las páginas. 
          Si no lo quieres en el Login, podrías moverlo dentro de LandingPage */}
      <Navbar />

      <Routes>
        {/* =========================================
            ZONA PÚBLICA
           ========================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* <--- Agregada */}

        {/* =========================================
            ZONA PRIVADA (Protegida)
           ========================================= */}
        <Route element={<ProtectedRoute />}>
            
            {/* 1. SELECCIÓN DE COMUNIDAD */}
            <Route path="/home" element={<HomePage />} />

            {/* 2. GESTIÓN DE COMUNIDAD (Layout con Sidebar) */}
            <Route path="/comunidad/:id" element={<DashboardLayout />}>
               {/* Cuando entras a /comunidad/1 se carga esto: */}
               <Route index element={<DashboardPage />} />
               
               {/* Cuando entras a /comunidad/1/residentes se carga esto: */}
               <Route path="residentes" element={<ResidentesPage />} />
               <Route path="dashboard" element={<DashboardPage />} />
               
               <Route path="finanzas" element={<IngresosEgresosPage />} />
            </Route>

        </Route>

      </Routes>
    </div>
  )
}

export default App