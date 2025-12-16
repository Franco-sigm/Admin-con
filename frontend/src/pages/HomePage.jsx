import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

function HomePage() {
  const [comunidades, setComunidades] = useState([])
  
  useEffect(() => {
    // Cargar las comunidades reales desde tu Backend
    client.get('/comunidades').then(res => setComunidades(res.data))
  }, [])

  return (
    <div className="container mx-auto p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Condominios</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          + Nueva Comunidad
        </button>
      </div>

      {/* GRID DE TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comunidades.map(comunidad => (
          <Link 
            key={comunidad.id} 
            to={`/comunidad/${comunidad.id}/residentes`} // <--- ESTO ES LA CLAVE
            className="block group"
          >
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition border border-gray-200 cursor-pointer h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  🏢 {/* Icono */}
                </div>
                <span className="text-sm text-gray-500">ID: {comunidad.id}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">
                {comunidad.nombre}
              </h3>
              <p className="text-gray-600 mt-2">{comunidad.direccion}</p>
              <div className="mt-4 text-blue-500 text-sm font-medium group-hover:underline">
                Entrar a administrar →
              </div>
            </div>
          </Link>
        ))}

        {/* Tarjeta vacía para agregar (opcional visualmente) */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition">
            <span className="text-4xl mb-2">+</span>
            <span>Agregar Comunidad</span>
        </div>
      </div>
    </div>
  )
}

export default HomePage