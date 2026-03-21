import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-conadmin.png'; 
import BotonSalir from '../components/BotonSalir.jsx';

// IMPORTACIÓN CLAVE: Usamos tu cliente de API configurado
import api from '../api/client'; 

const LoginPage = () => {
  // 1. ESTADOS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 2. FUNCIÓN LOGIN (Optimizada con Axios)
 // 2. FUNCIÓN LOGIN (Adaptada para FastAPI OAuth2)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Preparamos los datos como Form Data (Exigencia de FastAPI)
      const formData = new URLSearchParams();
      formData.append('username', email); // Tiene que llamarse 'username', no 'email'
      formData.append('password', password);

      // 2. Apuntamos a la ruta correcta de tu router y forzamos el Content-Type
      const response = await api.post('/api/usuarios/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 3. Extraemos el token del JSON de respuesta de FastAPI
      const { access_token } = response.data;

      // 4. Guardamos el token para que tu client.js lo inyecte automáticamente después
      localStorage.setItem('token', access_token);
      
      console.log("¡Login exitoso! Token guardado.");
      navigate('/home'); 

    } catch (error) {
      console.error("Error en login:", error);
      
      if (error.response) {
        // Mostramos el mensaje exacto que FastAPI nos envía ("Email o contraseña incorrectos")
        alert(error.response.data.detail || "Error de credenciales");
      } else if (error.request) {
        alert("El servidor backend parece estar apagado.");
      } else {
        alert("Error procesando la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:grid md:grid-cols-2 relative">
      <div className="absolute top-4 right-4 z-50">
        <BotonSalir />
      </div>
      
      {/* --- LADO IZQUIERDO: DISEÑO VISUAL (Intacto) --- */}
      <div className="relative overflow-hidden bg-gradient-to-tr from-emerald-600 to-[oklch(50%_0.134_242.749)] flex items-center justify-center p-12 lg:p-20 hidden md:flex">
        
        {/* Decoración */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-12 right-12 w-64 h-64 bg-[oklch(50%_0.134_242.749)]/40 rounded-full blur-2xl z-0 pointer-events-none"></div>

        {/* Tarjeta Glassmorphism */}
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

      {/* --- LADO DERECHO: FORMULARIO --- */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Bienvenido
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">Email</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(50%_0.134_242.749)] focus:border-transparent sm:text-sm transition-all"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(50%_0.134_242.749)] focus:border-transparent sm:text-sm transition-all"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[oklch(50%_0.134_242.749)] border-gray-300 rounded focus:ring-[oklch(50%_0.134_242.749)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[oklch(50%_0.134_242.749)] hover:text-[oklch(45%_0.134_242.749)]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
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
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>
           
           <p className="text-center text-sm text-gray-600">
             ¿Aún no tienes cuenta?{' '}
             <Link to="/register" className="font-medium text-[oklch(50%_0.134_242.749)] hover:underline">
               Regístrate aquí
             </Link>
           </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;