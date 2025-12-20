import { useState } from 'react';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // FastAPI espera x-www-form-urlencoded para el login (OAuth2 standard)
    const params = new URLSearchParams();
    params.append('username', email); // OJO: FastAPI usa 'username' aunque sea email
    params.append('password', password);

    try {
      const res = await client.post('/token', params);
      
      // GUARDAMOS EL TOKEN
      localStorage.setItem('token', res.data.access_token);
      
      // Nos vamos al Home
      navigate('/home');
      
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        
        <input 
          className="w-full mb-3 p-2 border rounded"
          type="email" 
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          className="w-full mb-4 p-2 border rounded"
          type="password" 
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Entrar
        </button>
         <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta? <Link to="/register" className="text-blue-500">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;