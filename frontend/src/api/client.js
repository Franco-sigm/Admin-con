import axios from "axios";

// Aquí está la clave para Producción:
//
const baseURL = import.meta.env.VITE_API_URL;

// Validación de seguridad por si se  olvida el archivo .env
if (!baseURL) {
  console.error(" ERROR CRÍTICO: Falta la variable VITE_API_URL en el archivo .env");
}

const client = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar sesión expirada (Error 401)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el backend dice "Token inválido", lo borramos y sacamos al usuario
      localStorage.removeItem("token");
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default client;