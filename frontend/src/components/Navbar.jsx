import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo-conadmin.png'; 


const Navbar = () => {
  const location = useLocation();
  
  // Rutas donde no se muestra el Navbar
  const rutasSinNavbar = ['/', '/login', '/register']; 
  
  if (rutasSinNavbar.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* 1. IZQUIERDA: LOGO Y BRAND */}
          <div className="flex items-center -ml-9">
            
              <img className="h-16 w-auto" src={logo} alt="logo-ConAdmin" />
              <span className="font-bold text-xl hidden sm:block -ml-8 -mt-2">
                <span className="text-[oklch(50%_0.134_242.749)]">CONADMIN</span>
              </span>
            
          </div>

          {/* 2. DERECHA: SOLO BOTÓN SALIR (Visible en Móvil y Escritorio) */}
          <div className="flex items-center">
            <Link to="/" className="no-underline">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition px-3 py-2 rounded-md hover:bg-red-50">
                <span>Salir</span>
                <span>➔</span>
              </button>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;