import { Routes, Route, Outlet, useParams } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx' 
import HomePage from './pages/HomePage'
import ResidentesPage from './pages/ResidentesPage'

// 1. Layout para el interior de una comunidad (Con Sidebar)
const DashboardLayout = () => {
  const { id } = useParams(); // Capturamos el ID de la URL (ej: 5)
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* El Sidebar recibe el ID para saber qué links generar */}
      <Sidebar comunidadId={id} />
      <div className="flex-1 p-8">
        <Outlet /> {/* Aquí se renderiza la página seleccionada (Residentes, Gastos, etc) */}
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
          {/* Aquí irán todas las opciones del sidebar */}
          <Route path="residentes" element={<ResidentesPage />} />
          {/* <Route path="gastos" element={<GastosPage />} /> */}
          
        </Route>

      </Routes>
    </div>
  )
}

export default App