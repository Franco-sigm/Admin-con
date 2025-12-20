import { useState } from 'react';
import client from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Enviamos los datos al Backend
      await client.post('/register', formData); // O '/registro' según tu ruta
      
      alert("¡Usuario creado! Ahora inicia sesión.");
      navigate('/login'); // 2. Si sale bien, nos manda al login
      
    } catch (error) {
      console.error(error);
      alert("Error al registrarse. Revisa la consola.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro</h2>
        
        <input 
          className="w-full mb-3 p-2 border rounded"
          placeholder="Nombre Completo"
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        />
        <input 
          className="w-full mb-3 p-2 border rounded"
          type="email" 
          placeholder="Correo"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          className="w-full mb-4 p-2 border rounded"
          type="password" 
          placeholder="Contraseña"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Registrarse
        </button>
        
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-500">Ingresa aquí</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;