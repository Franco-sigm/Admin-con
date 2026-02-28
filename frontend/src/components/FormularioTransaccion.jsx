import React, { useState } from 'react';
import axios from 'axios';

const FormularioTransaccion = ({ comunidadId, onSucess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'EGRESO',
    monto_total: '',
    metodo_pago: 'TRANSFERENCIA',
    descripcion: '',
    categoria: 'Otros',
    propiedad_id: ''
  });
  const [archivo, setArchivo] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    // Guardamos el archivo seleccionado
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. CREAR EL OBJETO FORMDATA (Clave para archivos)
    const data = new FormData();
    data.append('comunidad_id', comunidadId);
    data.append('tipo', formData.tipo);
    data.append('monto_total', formData.monto_total);
    data.append('metodo_pago', formData.metodo_pago);
    data.append('descripcion', formData.descripcion);
    data.append('categoria', formData.categoria);
    
    if (formData.propiedad_id) {
        data.append('propiedad_id', formData.propiedad_id);
    }

    // 2. AGREGAR EL ARCHIVO (Si existe)
    if (archivo) {
      data.append('archivo', archivo);
    }

    try {
      // 3. ENVIAR AL BACKEND
      const response = await axios.post('/api/finanzas/transacciones', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Indispensable para archivos
        },
      });
      
      alert("Transacción registrada con éxito");
      if (onSucess) onSucess(response.data);
    } catch (error) {
      console.error("Error al subir:", error.response?.data || error.message);
      alert("Error al registrar la transacción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Registrar Movimiento</h2>
      
      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <select name="tipo" onChange={handleChange} className="w-full border p-2 rounded">
          <option value="EGRESO">Egreso (Gasto)</option>
          <option value="INGRESO">Ingreso (Pago)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Monto</label>
        <input type="number" name="monto_total" required onChange={handleChange} className="w-full border p-2 rounded" placeholder="Ej: 5000" />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-600 font-bold">
            📁 Subir Comprobante (Imagen o PDF)
        </label>
        <input 
          type="file" 
          accept="image/*,.pdf" 
          onChange={handleFileChange} 
          className="w-full border p-2 rounded bg-blue-50 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-1">Soporta JPG, PNG y PDF</p>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-2 rounded text-white font-bold ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {loading ? 'Subiendo...' : 'Registrar Transacción'}
      </button>
    </form>
  );
};

export default FormularioTransaccion;