import React, { useState, useEffect, useCallback} from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado';
import { Home, Edit2, Trash2, Plus, Building, X, Percent, Search,  } from 'lucide-react'; 

const PropiedadesPage = () => {
  const { id } = useParams(); 
  
  // 1. Estados de datos (Cambiamos 'loading' a 'cargando' para ser consistentes con Residentes)
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 2. Estados de Paginación (Sincronizados con el Backend)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20; // En propiedades solemos mostrar un poco más por página

  // 3. Estados para el Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropiedad, setEditingPropiedad] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    prorrateo: '' 
  });

  // --- FUNCIÓN DE CARGA CON BÚSQUEDA GLOBAL ---
  const cargarPropiedades = useCallback(async () => {
    try {
      setCargando(true);
      const response = await api.get(`/api/propiedades/comunidad/${id}`, {
        params: { 
          page, 
          limit, 
          search: busqueda // Enviamos la búsqueda al servidor
        }
      });
      
      const { items, total } = response.data;
      setPropiedades(items || []);
      setTotalItems(total || 0);
      setTotalPages(Math.ceil((total || 0) / limit) || 1);

    } catch (error) {
      console.error("Error cargando propiedades:", error);
    } finally {
      setCargando(false);
    }
  }, [id, page, busqueda, limit]);

  // 4. Resetear a página 1 cuando el usuario busca algo nuevo
  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  // 5. useEffect con Debounce para evitar saturar el server
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (id) cargarPropiedades();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [id, page, busqueda, cargarPropiedades]);

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
    
    // 1. Validación básica (incluyendo que el prorrateo sea un número válido)
    if (!formData.numero || formData.prorrateo === '') {
      alert("Todos los campos son obligatorios");
      return;
    }

    // 2. Preparación del Payload
    const payload = {
      // Usamos .trim() para evitar espacios accidentales en el número de unidad
      numero_unidad: formData.numero.toString().trim(), 
      prorrateo: parseFloat(formData.prorrateo),
      comunidad_id: parseInt(id)
    };

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingPropiedad) {
        // EDICIÓN
        await api.put(`/api/propiedades/${editingPropiedad.id}`, payload, config);
        alert("✅ Propiedad actualizada");
      } else {
        // CREACIÓN
        await api.post('/api/propiedades', payload, config);
        alert("✅ Propiedad creada");
      }

      // 3. Post-guardado: Cerrar modal y refrescar la lista con los nuevos datos
      cerrarModal();
      cargarPropiedades(); 

    } catch (error) {
      console.error("Error al guardar:", error);
      // Extraer mensaje de error del backend si existe
      const mensajeError = error.response?.data?.detail || "Hubo un error al guardar la propiedad.";
      alert(` ${mensajeError}`);
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
      
      if (propiedades.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        cargarPropiedades();
      }
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar. Asegúrate de que no tenga residentes o deudas asociadas.");
    }
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingPropiedad(null);
    setFormData({ numero: '', prorrateo: '' });
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

useEffect(() => {
  setPage(1);
}, [busqueda]);

// B. Carga con Debounce (300ms)
useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (id) cargarPropiedades();
  }, 300);

  return () => clearTimeout(delayDebounceFn);
}, [id, page, busqueda, cargarPropiedades]);

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


        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por unidad..."
            value={busqueda} // <--- Conectado al estado
            onChange={(e) => setBusqueda(e.target.value)} // <--- Actualiza el estado
            className="pl-10 pr-4 py-2 border rounded-lg ..." 
          />
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
        {cargando ? (
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
                  page={page} 
                  setPage={setPage} 
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
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-200/50">
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
                      name="numero"
                      type="text" required autoFocus
                      placeholder="Ej: 101, Casa 5..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.numero}
                      onChange={handleInputChange}
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
                      name="prorrateo"
                      type="number" step="0.000001" required
                      placeholder="Ej: 0.025"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={formData.prorrateo}
                      onChange={handleInputChange}
                    />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Ingresa el valor en decimales. Ej: <strong className="text-gray-700">0.05</strong> equivale al <strong className="text-gray-700">5%</strong>.
                </p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={cerrarModal} 
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