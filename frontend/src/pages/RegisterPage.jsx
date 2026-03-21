import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-conadmin.png'; 
import BotonSalir from '../components/BotonSalir.jsx';

// 1. IMPORTAMOS NUESTRO CLIENTE AXIOS
import api from '../api/client'; 

function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. USAMOS API.POST
      // No ponemos la URL completa. client.js ya sabe si es Localhost o Producción.
      await api.post('/api/usuarios/', {
         nombre: formData.nombre,
         email: formData.email,
         password: formData.password,
         comunidad_id: null 
      });

      // Si Axios no lanza error, es que fue un éxito (200 OK)
      alert("¡Cuenta creada con éxito! Por favor inicia sesión.");
      navigate('/login');
      
    } catch (error) {
      console.error("Error en registro:", error);
      
      // Manejo de errores profesional
      if (error.response) {
        // El servidor respondió con un error (ej: Email duplicado)
        // El backend devuelve { "detail": "..." } o un array de errores de validación
        const mensaje = error.response.data.detail 
                        || JSON.stringify(error.response.data) 
                        || "No se pudo registrar.";
        alert(`Error: ${mensaje}`);
      } else {
        alert("Error de conexión. Verifica que el servidor esté activo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="min-h-screen md:grid md:grid-cols-2 relative">
      <div className="absolute top-4 right-4 z-50">
        <BotonSalir />
      </div>
      
      {/* --- LADO IZQUIERDO: VISUAL --- */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-emerald-600 to-[oklch(50%_0.134_242.749)] flex items-center justify-center p-12 lg:p-20 hidden md:flex">
        
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-12 right-12 w-64 h-64 bg-[oklch(50%_0.134_242.749)]/40 rounded-full blur-2xl z-0 pointer-events-none"></div>

        {/* Tarjeta Glassmorphism */}
        {/* Corregí un error de tipeo aquí: decía 'groupz-10' */}
        <div className="relative group z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl text-center">
          <div className="flex flex-col items-center justify-center">
              <img className="h-48 w-auto drop-shadow-lg animate-trompo" src={logo} alt="logo-ConAdmin" />
              <span className="font-bold text-3xl text-white -mt-12 tracking-tight">
                  ConAdmin
              </span>
          </div>
          <p className="text-emerald-100 mt-4 text-lg font-medium">
             Gestión inteligente para tu comunidad.
          </p>
        </div>
      </div>
                     
      {/* --- LADO DERECHO: FORMULARIO DE REGISTRO --- */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Completa tus datos para registrarte en el sistema.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
            {/* Input: Nombre */}
            <div>
                <label htmlFor="nombre" className="sr-only">Nombre Completo</label>
                <input 
                  id="nombre"
                  name="nombre"
                  type="text" 
                  required
                  placeholder="Nombre Completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(50%_0.134_242.749)] focus:border-transparent sm:text-sm transition-all"
                />
            </div>

            {/* Input: Email */}
            <div>
                <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  required
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(50%_0.134_242.749)] focus:border-transparent sm:text-sm transition-all"
                />
            </div>

            {/* Input: Password */}
            <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  required
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(50%_0.134_242.749)] focus:border-transparent sm:text-sm transition-all"
                />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[oklch(50%_0.134_242.749)] hover:bg-[oklch(45%_0.134_242.749)] focus:ring-2 focus:ring-offset-2 focus:ring-[oklch(50%_0.134_242.749)]'
                }`}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
              
          </form>
           
           {/* Footer: Ir al Login */}
           <p className="text-center text-sm text-gray-600">
             ¿Ya tienes cuenta?{' '}
             <Link to="/login" className="font-medium text-[oklch(50%_0.134_242.749)] hover:underline">
               Inicia sesión aquí
             </Link>
           </p>

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;