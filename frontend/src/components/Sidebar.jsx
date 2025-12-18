import { Link, useLocation } from 'react-router-dom'

// Recibimos 'comunidadId' y 'nombreComunidad' como props
function Sidebar({ comunidadId, nombreComunidad = "Cargando..." }) {
  const location = useLocation();

  // Función Helper: Devuelve las clases CSS según si el link está activo o no
  const getLinkClasses = (path) => {
    const isActive = location.pathname.includes(path);
    // Si está activo: fondo azul claro y texto azul oscuro. Si no: gris.
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive 
        ? 'bg-blue-50 text-blue-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  return (
    <aside className="w-64 bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-100 z-30">
      
      {/* 1. IDENTIDAD: Mostramos el nombre de la comunidad */}
      <div className="h-24 flex flex-col justify-center px-6 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          Gestionando:
        </span>
        <h2 className="text-lg font-bold text-gray-800 leading-tight" title={nombreComunidad}>
          {nombreComunidad}
        </h2>
      </div>
      
      {/* 2. MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {/* Link: Dashboard */}
        <Link 
          to={`/comunidad/${comunidadId}/dashboard`} 
          className={getLinkClasses('dashboard')}
        >
          {/* Icono Casa */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Panel de Control</span>
        </Link>

        {/* Link: Residentes */}
        <Link 
          to={`/comunidad/${comunidadId}/residentes`}
          className={getLinkClasses('residentes')}
        >
          {/* Icono Personas */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span>Residentes</span>
        </Link>

        {/* Link: Gastos */}
        <Link 
          to={`/comunidad/${comunidadId}/gastos`}
          className={getLinkClasses('gastos')}
        >
           {/* Icono Billete */}
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Ingresos y Egresos</span>
        </Link>
        
      </nav>

      {/* 3. FOOTER: Volver */}
      <div className="p-4 border-t border-gray-100">
         <Link to="/" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
           <span>⬅</span> Volver al Selector
         </Link>
      </div>
    </aside>
  )
}

export default Sidebar