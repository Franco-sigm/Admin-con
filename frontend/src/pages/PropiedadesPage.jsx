import React, { useState, useEffect, useCallback} from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado';
import { Home, Edit2, Trash2, Plus, Building, X, Percent, Search, Ruler } from 'lucide-react'; 


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
    prorrateo: '',
    superficie_m2: ''
  });

  // 4. Estados para Edición en Línea (Superficie)
  const [editingInlineId, setEditingInlineId] = useState(null);
  const [inlineValue, setInlineValue] = useState("");



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



  // Resetear a página 1 cuando el usuario busca algo nuevo
  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  // useEffect con Debounce para evitar saturar el server
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
        prorrateo: propiedad.prorrateo,
        superficie_m2: propiedad.superficie_m2 || ''
      });
    } else {
      setEditingPropiedad(null);
      setFormData({ numero: '', prorrateo: '', superficie_m2: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. Validación básica mejorada
  // Nota: La superficie_m2 puede ser 0 si el usuario prefiere calcularla después, 
  // pero el número de unidad es obligatorio.
  if (!formData.numero) {
    alert("El número de unidad es obligatorio");
    return;
  }

  // 2. Preparación del Payload incluyendo superficie_m2
  const payload = {
    numero_unidad: formData.numero.toString().trim(), 
    // Convertimos a float para asegurar compatibilidad con el Schema de FastAPI
    prorrateo: parseFloat(formData.prorrateo) || 0,
    superficie_m2: parseFloat(formData.superficie_m2) || 0, 
    comunidad_id: parseInt(id)
  };

  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 3. Ejecución de la petición según el modo (Edición o Creación)
    if (editingPropiedad) {
      // Usamos el payload completo para que el backend reciba la superficie
      await api.put(`/api/propiedades/${editingPropiedad.id}`, payload, config);
      // Opcional: Podrías usar un toast o notificación más elegante que el alert
      console.log("✅ Propiedad actualizada");
    } else {
      await api.post('/api/propiedades', payload, config);
      console.log("✅ Propiedad creada");
    }

    // 4. Post-guardado: Cerrar modal y refrescar la lista
    cerrarModal();
    cargarPropiedades(); 

  } catch (error) {
    console.error("Error al guardar:", error);
    
    // Manejo de errores detallado desde el backend (FastAPI)
    const mensajeError = error.response?.data?.detail;
    
    if (Array.isArray(mensajeError)) {
      // Si FastAPI devuelve errores de validación (pydantic)
      alert(`Error de validación: ${mensajeError.map(e => e.msg).join(", ")}`);
    } else {
      alert(mensajeError || "Hubo un error al guardar la propiedad.");
    }
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
    setFormData({ numero: '', prorrateo: '', superficie_m2: '' });
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

  // --- FUNCIONES PARA EDICIÓN EN LÍNEA DE SUPERFICIE ---
  const startInlineEdit = (prop) => {
    setEditingInlineId(prop.id);
    setInlineValue(prop.superficie_m2 || "");
  };

  const cancelInlineEdit = () => {
    setEditingInlineId(null);
    setInlineValue("");
  };

  const saveInlineEdit = async (prop) => {
    if (editingInlineId !== prop.id) return; // Evitar doble ejecución (ej: Enter + Blur)

    const newValue = parseFloat(inlineValue) || 0;
    
    // Cerramos el input inmediatamente para evitar parpadeos
    setEditingInlineId(null);

    if (newValue === (prop.superficie_m2 || 0)) return; // No hacer petición si no cambió

    try {
      const token = localStorage.getItem('token');
      const payload = {
        numero_unidad: prop.numero_unidad,
        prorrateo: prop.prorrateo,
        superficie_m2: newValue,
        comunidad_id: parseInt(id)
      };
      await api.put(`/api/propiedades/${prop.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizamos visualmente la tabla de inmediato
      setPropiedades(prev => prev.map(p => p.id === prop.id ? { ...p, superficie_m2: newValue } : p));
    } catch (error) {
      console.error("Error al actualizar superficie en línea:", error);
      alert("Error al actualizar la superficie.");
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
                    <th className="px-6 py-4 text-center">Superficie (m²)</th>
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
                      <td className="p-4 text-center font-mono text-sm font-semibold text-gray-600">
                        {editingInlineId === prop.id ? (
                          <input
                            type="number"
                            step="0.01"
                            autoFocus
                            className="w-24 px-2 py-1 text-center border-2 border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                            value={inlineValue}
                            onChange={(e) => setInlineValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEdit(prop);
                              if (e.key === 'Escape') cancelInlineEdit();
                            }}
                            onBlur={() => saveInlineEdit(prop)}
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors inline-block border border-transparent hover:border-indigo-100"
                            onClick={() => startInlineEdit(prop)}
                            title="Haz clic para editar la superficie"
                          >
                            {prop.superficie_m2 || '0'}
                          </div>
                        )}
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

  
      {/* --- MODAL PREMIUM ADAPTADO --- */}
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
                
                {/* NÚMERO DE UNIDAD */}
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

                {/* NUEVO: SUPERFICIE (M2) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Superficie Útil (m²)</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler className="h-4 w-4 text-gray-400" />
                      </div>
                      <input 
                        name="superficie_m2"
                        type="number" step="0.01"
                        placeholder="Ej: 54.25"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        value={formData.superficie_m2}
                        onChange={handleInputChange}
                      />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">
                    * Se usará para el cálculo automático del prorrateo.
                  </p>
                </div>

                

                {/* BOTONES */}
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
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
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