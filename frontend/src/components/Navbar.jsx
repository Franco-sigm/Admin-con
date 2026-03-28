import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Bell, User, Settings } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Lógica para alternar Dark Mode en el HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const rutasSinNavbar = ['/', '/login', '/register']; 
  
  if (rutasSinNavbar.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  return (
    <nav className="bg-white dark:bg-gray-500 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* IZQUIERDA: NOMBRE DE MARCA (Sin Logo) */}
          <div className="flex items-center group cursor-pointer" onClick={() => navigate('/dashboard')}>
             <div className="p-2 bg-indigo-600 rounded-lg mr-3 shadow-md shadow-indigo-200 dark:shadow-none">
                <Settings className="w-5 h-5 text-white animate-spin-slow" />
             </div>
             <span className="font-bold text-xl tracking-tight">
               <span className="text-indigo-600 dark:text-indigo-400">Admi</span>
               <span className="text-gray-900 dark:text-white">nistrador</span>
             </span>
          </div>

          {/* DERECHA: COMPONENTES GENÉRICOS Y DARK MODE */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* BOTÓN DARK MODE */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* NOTIFICACIONES (Genérico) */}
            <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>

            {/* PERFIL (Genérico) */}
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            
            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">Admin</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Gestor</p>
              </div>
            </button>

            {/* BOTÓN SALIR */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 transition-all px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <span className="hidden sm:inline">Salir</span>
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;