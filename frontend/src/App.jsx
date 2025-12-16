import { Routes, Route } from 'react-router-dom'
import Navbar from './components/NavBar'
import HomePage from './pages/HomePage'
import ResidentesPage from './pages/ResidentesPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* El Navbar siempre visible arriba */}
      <Navbar />

      <div className="container mx-auto p-4">
        {/* Aquí cambia el contenido mágicamente sin recargar */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/residentes" element={<ResidentesPage />} />
          {/* Aquí agregarás más rutas: /gastos, /anuncios... */}
        </Routes>
      </div>
    </div>
  )
}

export default App