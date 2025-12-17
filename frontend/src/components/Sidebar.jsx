import { Link, useLocation } from 'react-router-dom'

// Recibe el ID de la comunidad para saber a dónde apuntar los links
function Sidebar({ comunidadId }) {
  const location = useLocation();

  // Función para saber si el link está activo y pintarlo diferente
  const isActive = (path) => location.pathname.includes(path);

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Menú Principal
        </h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">

          <Link 
          to={`/comunidad/${comunidadId}/espacios`}
          className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
           Dashboard
        </Link>
        {/* Link a Residentes */}
        <Link 
          to={`/comunidad/${comunidadId}/residentes`}
          className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
            isActive('residentes') 
              ? 'bg-blue-50 text-blue-700 font-bold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          👥 detalle Residentes
        </Link>

        {/* Aquí se ira agregando más módulos */}
        <Link 
          to={`/comunidad/${comunidadId}/gastos`}
          className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          💰 ingresos y egresos
        </Link>
        
      
      </nav>

      <div className="p-4 border-t">
         <Link to="/" className="text-sm text-red-500 hover:text-red-700 flex items-center gap-2">
           ← Volver al Selector
         </Link>
      </div>
    </aside>
  )
}

export default Sidebar