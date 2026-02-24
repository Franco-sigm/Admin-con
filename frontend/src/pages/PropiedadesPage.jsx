import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import { Home, Edit2, Trash2, Plus, Building } from 'lucide-react'; 

const PropiedadesPage = () => {
  const { id } = useParams(); 
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropiedad, setEditingPropiedad] = useState(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    prorrateo: '' 
  });

  useEffect(() => {
    fetchPropiedades();
  }, [id]);

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // <-- Añadido
      const response = await api.get(`/api/propiedades/comunidad/${id}`, {
        headers: { Authorization: `Bearer ${token}` } // <-- Añadido
      });
      setPropiedades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando propiedades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (propiedad = null) => {
    if (propiedad) {
      setEditingPropiedad(propiedad);
      setFormData({
        numero: propiedad.numero_unidad,
        prorrateo: propiedad.prorrateo
      });
    } else {
      setEditingPropiedad(null);
      setFormData({ numero: '', prorrateo: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero || !formData.prorrateo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const payload = {
      numero_unidad: formData.numero, 
      prorrateo: parseFloat(formData.prorrateo),
      comunidad_id: parseInt(id)
    };

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      if (editingPropiedad) {
        await api.put(`/api/propiedades/${editingPropiedad.id}`, payload, config);
        alert("✅ Propiedad actualizada");
      } else {
        await api.post('/api/propiedades', payload, config);
        alert("✅ Propiedad creada");
      }
      setIsModalOpen(false);
      fetchPropiedades(); 
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar la propiedad.");
    }
  };

  const handleDelete = async (propiedadId) => {
    if (!window.confirm("¿Estás seguro? Si borras esta propiedad, podrías perder historial asociado si no tienes cuidado.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token'); // <-- Añadido
      await api.delete(`/api/propiedades/${propiedadId}`, {
        headers: { Authorization: `Bearer ${token}` } // <-- Añadido
      });
      alert("🗑️ Propiedad eliminada");
      fetchPropiedades();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar. Asegúrate de que no tenga residentes o deudas asociadas.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="w-6 h-6 text-indigo-600" />
            Gestión de Propiedades
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configura las unidades y sus porcentajes de copropiedad.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus size={18} />
          Nueva Propiedad
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Unidad / Depto</th>
              <th className="p-4 font-semibold text-center">Prorrateo (Coeficiente)</th>
              <th className="p-4 font-semibold text-center">Porcentaje Visual</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-400">Cargando datos...</td></tr>
            ) : propiedades.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center text-gray-400">No hay propiedades registradas aún.</td></tr>
            ) : (
              propiedades.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-gray-400" />
                      {prop.numero_unidad}
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-sm text-gray-600">
                    {prop.prorrateo}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                      {(prop.prorrateo * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(prop)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prop.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingPropiedad ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Unidad</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Ej: Depto 204"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prorrateo (Decimal)
                  </label>
                  <input 
                    type="number"
                    step="0.000001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Ej: 0.025"
                    value={formData.prorrateo}
                    onChange={(e) => setFormData({...formData, prorrateo: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa el valor decimal. Ejemplo: <strong>0.05</strong> equivale al <strong>5%</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                >
                  {editingPropiedad ? 'Guardar Cambios' : 'Crear Propiedad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropiedadesPage;