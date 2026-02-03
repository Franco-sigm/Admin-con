import { useState } from 'react' // Importamos useState
import { Link, useLocation } from 'react-router-dom'

function Sidebar({ comunidadId, nombreComunidad = "Cargando..." }) {
  const location = useLocation();
  // Estado para controlar si está plegada (true) o expandida (false)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función Helper: Devuelve las clases CSS dinámicas
  const getLinkClasses = (path) => {
    const isActive = location.pathname.includes(path);
    
    return `flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-blue-50 text-blue-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white shadow-xl min-h-screen flex flex-col border-r border-gray-100 z-30 transition-all duration-300 ease-in-out relative`}
    >
      
      {/* BOTÓN DE TOGGLE (Para abrir/cerrar) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 bg-white border border-gray-200 text-gray-500 rounded-full p-1 shadow-md hover:bg-gray-50 hover:text-blue-600 transition z-40"
      >
        {/* Icono Flecha izquierda/derecha según estado */}
        {isCollapsed ? (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        )}
      </button>

      {/* 1. IDENTIDAD */}
      <div className={`h-24 flex flex-col justify-center border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'items-center px-0' : 'px-6'}`}>
        
        {/* Texto "Gestionando" */}
        <span className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
          Gestionando:
        </span>

        {/* Nombre Comunidad o Inicial */}
        <h2 className="font-bold text-gray-800 leading-tight truncate transition-all duration-300" title={nombreComunidad}>
          {isCollapsed ? (
            // Si está cerrado, mostramos la primera letra en un círculo
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl">
               {nombreComunidad.charAt(0)}
            </div>
          ) : (
            // Si está abierto, mostramos el nombre completo (con truncate por si es largo)
            <span className="text-lg block w-48 truncate">{nombreComunidad}</span>
          )}
        </h2>
      </div>
      
      {/* 2. MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-3 py-6 space-y-2">

        {/* Link: Dashboard */}
        <Link to={`/comunidad/${comunidadId}/dashboard`} className={getLinkClasses('dashboard')} title="Panel de Control">
          <svg className="w-6 h-6 min-w-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
            Panel de Control
          </span>
        </Link>

        {/* Link: Residentes */}
        <Link to={`/comunidad/${comunidadId}/residentes`} className={getLinkClasses('residentes')} title="Residentes">
          <svg className="w-6 h-6 min-w-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
            Residentes
          </span>
        </Link>

        {/* Link: Gastos */}
        <Link to={`/comunidad/${comunidadId}/finanzas`} className={getLinkClasses('gastos')} title="Ingresos y Egresos">
           <svg className="w-6 h-6 min-w-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
            Ingresos y Egresos
          </span>
        </Link>

        {/* Link: Informes */}
        <Link to={`/comunidad/${comunidadId}/informes`} className={getLinkClasses('informes')} title="Informes y Reportes">
           <svg className="w-6 h-6 min-w-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 012-2h6M9 17H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.343M9 17l3 3m0 0l3-3m-3 3V10m0 0l3-3m-3 3L6 7"></path></svg>
           <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
            Informes y Reportes
          </span>
        </Link>
        
      </nav>

      {/* 3. FOOTER: Volver */}
      <div className="p-4 border-t border-gray-100 overflow-hidden">
         <Link to="/home" className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors`} title="Volver al Selector">
           <span>⬅</span> 
           <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
              Volver a Home
           </span>
         </Link>
      </div>
    </aside>
  )
}

export default Sidebar