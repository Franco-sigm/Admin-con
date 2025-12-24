import axios from "axios";

const client = axios.create({
    baseURL: 'http://127.0.0.1:5000',
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Buscamos el token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Lo pegamos
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;

