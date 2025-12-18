import { useState, useEffect } from 'react' 
import { Routes, Route, Outlet, useParams } from 'react-router-dom'

// --- COMPONENTES ---
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx' 
import client from './api/client' 

// --- PÁGINAS ---
import HomePage from './pages/HomePage'
import ResidentesPage from './pages/ResidentesPage'
import DashboardPage from './pages/DashboardPage' // <--- ¡ESTO FALTABA!

// 1. Layout para el interior de una comunidad (Con Sidebar)
const DashboardLayout = () => {
  const { id } = useParams();
  
  const [comunidad, setComunidad] = useState(null)

  useEffect(() => {
    client.get(`/comunidades/${id}`)
      .then(res => setComunidad(res.data))
      .catch(err => console.error(err))
  }, [id])
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* El Sidebar recibe el ID y el Nombre */}
      <Sidebar 
        comunidadId={id} 
        nombreComunidad={comunidad?.nombre} 
      />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* Aquí se renderiza el DashboardPage, ResidentesPage, etc */}
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* El Navbar Global se mantiene arriba siempre */}
      <Navbar />

      <Routes>
        {/* RUTA 1: El Selector de Comunidades (Sin Sidebar) */}
        <Route path="/" element={<HomePage />} />

        {/* RUTA 2: El Interior de la Comunidad (Con Sidebar) */}
        <Route path="/comunidad/:id" element={<DashboardLayout />}>
          
          {/* RUTA POR DEFECTO: Si entras a /comunidad/5, carga el Dashboard */}
          <Route index element={<DashboardPage />} /> 
          
          {/* Rutas explícitas */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="residentes" element={<ResidentesPage />} />
          
          {/* Futuras rutas:
          <Route path="gastos" element={<GastosPage />} /> 
          */}
          
        </Route>

      </Routes>
    </div>
  )
}

export default App