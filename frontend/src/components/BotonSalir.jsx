import React from 'react';
import { Link } from 'react-router-dom';

const BotonSalir = () => {
  return (
    <Link to="/" className="no-underline">
      <button 
        type="button" // Importante para que no envíe el formulario si está dentro de <form>
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-500 transition px-3 py-2 rounded-md hover:bg-red-50"
      >
        <span>Salir</span>
        <span>➔</span>
      </button>
    </Link>
  );
};

export default BotonSalir;