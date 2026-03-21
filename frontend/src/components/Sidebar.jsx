import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  FileText,
  PieChart,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

function Sidebar({ comunidadId, nombreComunidad = "Cargando..." }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getLinkClasses = ({ isActive }) => `
    flex items-center
    ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}
    py-3 rounded-xl
    transition-all duration-200
    font-medium text-sm
    ${
      isActive
        ? 'bg-gray-400 text-white shadow-sm'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }
  `;

  const menuItems = [
    { name: 'Panel', path: 'dashboard', icon: LayoutDashboard },
    { name: 'Residentes', path: 'residentes', icon: Users },
    { name: 'Propiedades', path: 'propiedades', icon: Building2 },
    { name: 'Finanzas', path: 'finanzas', icon: Wallet },
    { name: 'Deudas', path: 'cargos', icon: FileText },
    { name: 'Reportes', path: 'reportes', icon: PieChart },
    { name: 'Cierre de Mes', path: 'cierre-mes', icon: PieChart },
  ];

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-white
        border-r border-gray-100
        min-h-screen
        flex flex-col
        transition-all duration-300 ease-in-out
        relative z-40
      `}
    >
      {/* Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -right-3 top-8
          bg-white
          border border-gray-200
          text-gray-400
          rounded-full p-1.5
          shadow-sm
          hover:text-gray-700
          transition
        "
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Identidad */}
      <div
        className={`
          h-24 flex flex-col justify-center
          border-b border-gray-100
          transition-all duration-300
          ${isCollapsed ? 'items-center' : 'px-6'}
        `}
      >
        {!isCollapsed && (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Gestionando
          </span>
        )}

        {isCollapsed ? (
          <div className="
            w-11 h-11
            bg-gray-900 text-white
            rounded-2xl
            flex items-center justify-center
            text-lg font-semibold
          ">
            {nombreComunidad.charAt(0)}
          </div>
        ) : (
          <h2
            className="text-base font-bold text-gray-900 truncate"
            title={nombreComunidad}
          >
            {nombreComunidad}
          </h2>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={`/comunidad/${comunidadId}/${item.path}`}
            className={getLinkClasses}
          >
            <item.icon size={18} className="min-w-[18px]" />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/home"
          className={`
            flex items-center gap-3
            w-full px-4 py-3
            text-sm font-medium
            rounded-xl
            text-gray-500
            hover:bg-gray-100 hover:text-gray-900
            transition
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}
        >
          <LogOut size={18} className="min-w-[18px]" />
          {!isCollapsed && <span>Volver</span>}
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;