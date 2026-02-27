import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado';
import { Home, Edit2, Trash2, Plus, Building, X, Percent } from 'lucide-react'; 

const PropiedadesPage = () => {
  const { id } = useParams(); 
  
  // Estados principales
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropiedad, setEditingPropiedad] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    prorrateo: '' 
  });

  // Estados de Paginación
  const limit = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchPropiedades();
  }, [id, currentPage]);

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const response = await api.get(`/api/propiedades/comunidad/${id}?page=${currentPage}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const { total, items } = response.data;
      setPropiedades(items || []);
      setTotalItems(total || 0);
      setTotalPages(Math.ceil((total || 0) / limit) || 1);

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
      numero_unidad: formData.numero.toString(), 
      prorrateo: parseFloat(formData.prorrateo),
      comunidad_id: parseInt(id)
    };

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token'); 
      await api.delete(`/api/propiedades/${propiedadId}`, {
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("🗑️ Propiedad eliminada");
      
      if (propiedades.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchPropiedades();
      }
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar. Asegúrate de que no tenga residentes o deudas asociadas.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-100 shadow-sm">
                <Building className="w-7 h-7 text-indigo-600" />
            </div>
            Gestión de Propiedades
          </h1>
          <p className="text-gray-500 text-sm mt-2">Configura las unidades, departamentos y sus porcentajes de copropiedad.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-md shadow-gray-900/20 transition-all duration-200 flex items-center justify-center gap-2 font-medium active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nueva Propiedad
        </button>
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col">
        {loading ? (
           <div className="p-16 flex flex-col items-center justify-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
              <p className="text-sm font-medium animate-pulse">Cargando propiedades...</p>
           </div>
        ) : propiedades.length === 0 ? (
           <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-16 m-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                 <Building className="w-7 h-7 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">Sin propiedades</h3>
             <p className="text-sm text-gray-500 max-w-sm">Aún no hay unidades registradas. Haz clic en "Nueva Propiedad" para empezar a configurar el condominio.</p>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-200/80">
                  <tr>
                    <th className="p-4 font-semibold">Unidad / Depto</th>
                    <th className="p-4 font-semibold text-center">Prorrateo (Coeficiente)</th>
                    <th className="p-4 font-semibold text-center">Porcentaje Visual</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80 bg-white">
                  {propiedades.map((prop) => (
                    <tr key={prop.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4 font-semibold text-sm text-gray-900 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                             <Home size={14} className="text-gray-500" />
                        </div>
                        {prop.numero_unidad}
                      </td>
                      <td className="p-4 text-center font-mono text-sm font-semibold text-gray-600">
                        {prop.prorrateo}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-1 text-[11px] rounded-md font-bold tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                          {(prop.prorrateo * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenModal(prop)}
                            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prop.id)}
                            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Premium */}
            {totalItems > 0 && (
              <div className="px-6 py-2 bg-gray-50 border-t border-gray-200/80">
                <BotonPaginado
                  page={currentPage} 
                  setPage={setCurrentPage} 
                  totalPages={totalPages} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL PREMIUM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform">
            
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                 {editingPropiedad ? 'Editar Propiedad' : 'Nueva Propiedad'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-200/50">
                 <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Número de Unidad / Depto</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" required autoFocus
                      placeholder="Ej: 101, Casa 5..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Prorrateo (Decimal)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number" step="0.000001" required
                      placeholder="Ej: 0.025"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.prorrateo}
                      onChange={(e) => setFormData({...formData, prorrateo: e.target.value})}
                    />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Ingresa el valor en decimales. Ej: <strong className="text-gray-700">0.05</strong> equivale al <strong className="text-gray-700">5%</strong>.
                </p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all active:scale-95"
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