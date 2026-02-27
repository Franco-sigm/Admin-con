import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado'; 
import { Users, Search, Plus, Edit2, Trash2, Home, Mail, Phone, Percent, AlertCircle, X, User } from 'lucide-react';

const INITIAL_FORM_STATE = {
  id: null,
  nombre: '',
  numero_unidad: '', 
  prorrateo: '',     
  email: '',
  telefono: '',
  propiedad_id: null
};

function ResidentesPage() {
  const { id } = useParams(); 
  
  const [residentes, setResidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formResidente, setFormResidente] = useState(INITIAL_FORM_STATE);
  
  // Estados de Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const limit = 15; 

  // --- CARGAR DATOS ---
  useEffect(() => {
    if (id) cargarPropiedadesYResidentes();
  }, [id, page]);

 const cargarPropiedadesYResidentes = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const respuesta = await api.get(`/api/residentes/comunidad/${id}?page=${page}&limit=${limit}`, config);
      
      const listaResidentes = respuesta.data.items || [];
      const totalRegistros = respuesta.data.total || 0;

      if (Array.isArray(listaResidentes)) {
          const datosFormateados = listaResidentes.flatMap(res => {
              if (res.propiedades && res.propiedades.length > 0) {
                  return res.propiedades.map(prop => ({
                      id: res.id, 
                      propiedad_id: prop.id,          
                      numero_unidad: prop.numero_unidad || 'N/A',
                      prorrateo: prop.prorrateo || 0,
                      nombre: res.nombre,
                      email: res.email || '',
                      telefono: res.telefono || '',
                      estado_pago: res.estado_pago || 'AL_DIA' 
                  }));
              } else {
                  return [{
                      id: res.id, 
                      propiedad_id: null,          
                      numero_unidad: 'Sin Unidad',
                      prorrateo: 0,
                      nombre: res.nombre,
                      email: res.email || '',
                      telefono: res.telefono || '',
                      estado_pago: res.estado_pago || 'AL_DIA' 
                  }];
              }
          });
          
          setResidentes(datosFormateados);
          setTotalItems(totalRegistros); 
          setTotalPages(Math.ceil(totalRegistros / limit));
      } else {
          setResidentes([]);
          setTotalItems(0);
      }

    } catch (error) {
      console.error("Error cargando la lista:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
          alert("Sesión expirada o sin permisos. Por favor, inicia sesión de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  const [unidadExistente, setUnidadExistente] = useState(null);

  useEffect(() => {
    const verificarUnidad = async () => {
      if (!formResidente.id && formResidente.numero_unidad) {
        try {
          const token = localStorage.getItem('token');
          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          const respuesta = await api.get(`/api/propiedades/comunidad/${id}`, config);
          const propiedades = respuesta.data;
          
          const coincidencia = propiedades.find(
            p => p.numero_unidad?.toLowerCase() === formResidente.numero_unidad.toLowerCase()
          );

          if (coincidencia) {
            setUnidadExistente(coincidencia);
            setFormResidente(prev => ({ ...prev, prorrateo: coincidencia.prorrateo }));
          } else {
            setUnidadExistente(null);
          }
        } catch (error) {
          console.error("Error verificando si la unidad existe:", error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      verificarUnidad();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formResidente.numero_unidad, id]); 

  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    setFormResidente({
      ...formResidente,
      [e.target.name]: e.target.value
    });
  };

  const handleEditar = (residente) => {
    setFormResidente({
      ...residente,
      prorrateo: residente.prorrateo 
    }); 
    setMostrarModal(true);       
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormResidente(INITIAL_FORM_STATE);
  };

  const handleSubmit = async (e) => {
   e.preventDefault();
   const comunidadIdNum = parseInt(id);
   const token = localStorage.getItem('token');
   const config = { headers: { Authorization: `Bearer ${token}` } };

   try {
     if (formResidente.id && formResidente.propiedad_id) {
       await api.put(`/api/residentes/${formResidente.id}`, {
         nombre: formResidente.nombre,
         email: formResidente.email,
         telefono: formResidente.telefono,
         propiedad_id: formResidente.propiedad_id
       }, config);
       alert("✅ Residente actualizado");
     } else {
       const resBusqueda = await api.get(`/api/propiedades/comunidad/${comunidadIdNum}?limit=1000`, config);
       const propiedadesExistentes = resBusqueda.data.items || (Array.isArray(resBusqueda.data) ? resBusqueda.data : []);
       
       let propiedadDestino = propiedadesExistentes.find(
         p => p.numero_unidad.toLowerCase() === formResidente.numero_unidad.toLowerCase()
       );

       let propiedadIdFinal;

       if (propiedadDestino) {
         propiedadIdFinal = propiedadDestino.id;
       } else {
         const resNuevaProp = await api.post(`/api/propiedades`, {
           numero_unidad: formResidente.numero_unidad,
           prorrateo: parseFloat(formResidente.prorrateo) || 0,
           comunidad_id: comunidadIdNum
         }, config);
         propiedadIdFinal = resNuevaProp.data.id;
       }

       await api.post(`/api/residentes`, {
         nombre: formResidente.nombre,
         email: formResidente.email,
         telefono: formResidente.telefono,
         propiedad_id: propiedadIdFinal
       }, config);
       
       alert("✅ Residente registrado correctamente");
     }
     
     cerrarModal();
     cargarPropiedadesYResidentes();
     
   } catch (error) {
     console.error("❌ Error en el proceso:", error);
     const msg = error.response?.data?.detail || "Error al procesar el registro.";
     alert(`Hubo un error: ${msg}`);
   }
  };

  const handleEliminar = async (residenteId, propiedadId) => {
    if (!window.confirm("¿Eliminar residente y liberar la unidad? Esta acción es irreversible.")) return;

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if(residenteId) {
          await api.delete(`/api/residentes/${residenteId}`, config);
          alert("Residente eliminado. La unidad ahora está vacía.");
      } else {
          await api.delete(`/api/propiedades/${propiedadId}`, config);
          alert("Unidad física eliminada.");
      }
      
      if (residentes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        cargarPropiedadesYResidentes();
      }
    } catch (error) {
      console.error("❌ Error eliminando:", error);
      alert("No se pudo eliminar.");
    }
  };

  const [busqueda, setBusqueda] = useState('');

  const residentesFiltrados = residentes.filter((res) => {
    const textoBusqueda = busqueda.toLowerCase();
    const nombre = res.nombre?.toLowerCase() || '';
    const unidad = res.numero_unidad?.toLowerCase() || '';
    return nombre.includes(textoBusqueda) || unidad.includes(textoBusqueda);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-100 shadow-sm">
                <Users className="w-7 h-7 text-indigo-600" />
            </div>
            Padrón de Residentes
          </h1>
          <p className="text-gray-500 text-sm mt-2">Gestiona propietarios, unidades y su información de contacto.</p>
        </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS (Toolbar Premium) --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 p-5 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col md:flex-row items-center gap-4 justify-between transition-all duration-300 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)]">
        
        {/* BARRA DE BÚSQUEDA UI */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o unidad..."
            className="pl-9 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button 
          onClick={() => { 
            setFormResidente(INITIAL_FORM_STATE); 
            setMostrarModal(true); 
          }}
          className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-md shadow-gray-900/20 transition-all duration-200 flex items-center justify-center gap-2 font-medium active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nuevo Residente
        </button>
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col">
        {cargando ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
             <p className="text-sm font-medium animate-pulse">Cargando padrón...</p>
          </div>
        ) : residentes.length === 0 ? (
           <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-16 m-6 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                 <Users className="w-7 h-7 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">Sin residentes</h3>
             <p className="text-sm text-gray-500 max-w-sm">No hay residentes registrados. Haz clic en "Nuevo Residente" para empezar.</p>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-200/80">
                  <tr>
                    <th className="p-4 font-semibold">Unidad</th>
                    <th className="p-4 font-semibold">Nombre</th>
                    <th className="p-4 font-semibold">Contacto</th>
                    <th className="p-4 font-semibold">Estado de Pago</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80 bg-white">
                  {residentesFiltrados.map((res) => (
                    <tr key={res.propiedad_id} className="hover:bg-gray-50/80 transition-colors group">
                      
                      <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                             <Home className="w-4 h-4 text-gray-400" />
                             Unidad {res.numero_unidad}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 ml-6">Coef: {res.prorrateo}</div>
                      </td>
                      
                      <td className="p-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2">
                             <span className="text-gray-900 font-bold">{res.nombre}</span>
                             {!res.id && (
                               <span className="px-2 py-0.5 text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md uppercase tracking-widest shadow-sm">Vacío</span>
                             )}
                          </div>
                      </td>
                      
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col gap-1">
                              {res.email ? (
                                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 opacity-70" /> {res.email}</div>
                              ) : <span className="text-gray-300">-</span>}
                              
                              {res.telefono && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400"><Phone className="w-3.5 h-3.5 opacity-70" /> {res.telefono}</div>
                              )}
                          </div>
                      </td>
                      
                      <td className="p-4 whitespace-nowrap text-sm">
                        <span className={`inline-block px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border shadow-[inset_0_1px_0_rgba(255,255,255,1)] 
                          ${res.estado_pago === 'MOROSO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {res.estado_pago === 'MOROSO' ? 'Moroso' : 'Al Día'}
                        </span>
                      </td>
                      
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditar(res)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all" title="Editar Residente">
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEliminar(res.id, res.propiedad_id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Eliminar/Liberar Unidad">
                             <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             
            {/* PAGINACIÓN */}
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
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-transform" onClick={(e) => e.stopPropagation()}>
            
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    {formResidente.id ? 'Editar Residente' : 'Nueva Unidad y Residente'}
                 </h2>
                 <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 transition-colors p-1"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Sección Unidad */}
              {!formResidente.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unidad (Depto)</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Home className="h-4 w-4 text-gray-400" /></div>
                           <input 
                             type="text" name="numero_unidad" value={formResidente.numero_unidad} onChange={handleInputChange} 
                             placeholder="Ej: 101" required 
                             className={`w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${
                               unidadExistente ? 'border-blue-300 ring-2 ring-blue-500/20 bg-blue-50/50' : 'border-gray-200 focus:border-indigo-500'
                             }`} 
                           />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prorrateo</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Percent className="h-4 w-4 text-gray-400" /></div>
                           <input 
                             type="number" step="0.000001" name="prorrateo" value={formResidente.prorrateo} onChange={handleInputChange} 
                             placeholder="0.025" required disabled={!!unidadExistente}
                             className={`w-full pl-10 pr-4 py-2.5 font-mono border rounded-xl text-sm font-bold outline-none transition-all ${
                               unidadExistente ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50/50 text-gray-900 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                             }`} 
                           />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mensaje inteligente */}
                    {unidadExistente && (
                      <div className="flex items-start gap-2 text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-bold mb-0.5">Esta unidad ya existe en el sistema.</p>
                          <p className="opacity-80">El nuevo residente se vinculará a ella automáticamente y se mantendrá el prorrateo actual de la propiedad.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Unidad</label>
                      <input type="text" value={formResidente.numero_unidad} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Prorrateo</label>
                      <input type="text" value={formResidente.prorrateo} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>
                )}

              {/* Datos de la Persona */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre del Residente</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                    <input type="text" name="nombre" value={formResidente.nombre} onChange={handleInputChange} required 
                           className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                        <input type="email" name="email" value={formResidente.email} onChange={handleInputChange} required 
                               className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                        <input type="text" name="telefono" value={formResidente.telefono} onChange={handleInputChange} 
                               className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                  </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                   Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all active:scale-95">
                  {formResidente.id ? 'Guardar Cambios' : 'Registrar Residente'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResidentesPage;