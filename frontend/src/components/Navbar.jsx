import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate
import logo from '../assets/logo-conadmin.png'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 2. Inicializamos el hook de navegación
  
  const rutasSinNavbar = ['/', '/login', '/register']; 
  
  if (rutasSinNavbar.includes(location.pathname)) {
    return null;
  }

  // 3. ESTA ES LA FUNCIÓN DE SEGURIDAD
  const handleLogout = () => {
    // A. Borramos la credencial de seguridad
    localStorage.removeItem('token'); 
    
    // B. Redirigimos al usuario (al Login)
    navigate('/login'); 
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* IZQUIERDA: LOGO */}
          <div className="flex items-center -ml-9 group">
             <img className="h-16 w-auto animate-trompo" src={logo} alt="logo-ConAdmin" />
             <span className="font-bold text-xl hidden sm:block -ml-8 -mt-2">
               <span className="text-[oklch(50%_0.134_242.749)]">CONADMIN</span>
             </span>
          </div>

          {/* DERECHA: BOTÓN SALIR SEGURO */}
          <div className="flex items-center">
            {/* 4. QUITAMOS EL <Link> Y USAMOS onClick 
               Ya no es un enlace simple, ahora es un botón funcional 
            */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition px-3 py-2 rounded-md hover:bg-red-50"
            >
              <span>Salir</span>
              <span>➔</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;