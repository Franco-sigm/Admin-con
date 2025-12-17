import { Link } from 'react-router-dom';

function Navbar() {
  return (
    // Esta barra es HORIZONTAL (w-full, h-16) y se queda arriba
    <nav className="bg-white shadow-sm border-b border-gray-200 h-16 w-full flex items-center justify-between px-6 relative z-10">
      
      {/* IZQUIERDA: Logo y Nombre */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
          {/* Icono simple */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
        </div>
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
          AdminCon
        </Link>
      </div>

      {/* DERECHA: Menú de Usuario */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-700">Conserjería</p>
          <p className="text-xs text-gray-500">Turno Mañana</p>
        </div>
        
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
          C
        </div>

        <button className="text-sm text-gray-500 hover:text-red-500 transition border-l pl-4 ml-2">
          Salir
        </button>
      </div>

    </nav>
  )
}

export default Navbar