import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado'; 
import { Users, Search, Plus, Edit2, Trash2, Home, Mail, Phone, Percent, AlertCircle, X, User } from 'lucide-react';
import ImportarResidentesModal from '../components/ImportarResidentesModal';

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
  
  // Estados de datos
  const [residentes, setResidentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formResidente, setFormResidente] = useState(INITIAL_FORM_STATE);
  const [unidadExistente, setUnidadExistente] = useState(null);
  const [mostrarModalImport, setMostrarModalImport] = useState(false); // Nuevo estado para el modal de importación
  
  // Estados de Paginación (Sincronizados con el Backend)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const limit = 15; 

  const [busqueda, setBusqueda] = useState('');

  // --- FUNCIÓN DE CARGA PRINCIPAL ---
  const cargarPropiedadesYResidentes = useCallback(async () => {
  try {
    setCargando(true);
    
    const response = await api.get(`/api/residentes/comunidad/${id}`, {
      params: { page, limit, search: busqueda }
    });
    
    const { items, total } = response.data;

    // GUARDAMOS LOS ITEMS DIRECTAMENTE
    // Cada 'item' es una Propiedad que contiene su lista de 'residentes'
    setResidentes(items || []); 
    
    setTotalItems(total || 0);
    setTotalPages(Math.ceil((total || 0) / limit) || 1);

  } catch (error) {
    console.error("Error cargando la lista:", error);
  } finally {
    setCargando(false);
  }
}, [id, page, busqueda, limit]);

useEffect(() => {
  setPage(1);
}, [busqueda]);

  // NUEVO useEffect de carga con soporte para Búsqueda Global
useEffect(() => {
  // Creamos un temporizador (Debounce)
  // Esto evita que se haga una petición por cada letra que escribes.
  // Solo buscará cuando dejes de escribir por 300ms.
  const delayDebounceFn = setTimeout(() => {
    if (id) {
      cargarPropiedadesYResidentes();
    }
  }, 300); 

  // Limpiamos el temporizador si el usuario sigue escribiendo
  return () => clearTimeout(delayDebounceFn);
  
  // Ahora el efecto "escucha" a: id, page y busqueda
}, [id, page, busqueda, cargarPropiedadesYResidentes]);
  // --- VERIFICACIÓN DE UNIDAD (Evitar duplicados) ---
  useEffect(() => {
    const verificarUnidad = async () => {
      if (!formResidente.id && formResidente.numero_unidad) {
        try {
          const respuesta = await api.get(`/api/propiedades/comunidad/${id}`);
          const propiedades = Array.isArray(respuesta.data) ? respuesta.data : (respuesta.data.items || []);
          
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
          console.error("Error verificando unidad:", error);
        }
      }
    };
    const timeoutId = setTimeout(verificarUnidad, 500);
    return () => clearTimeout(timeoutId);
  }, [formResidente.numero_unidad, id]); 

  // --- MANEJADORES ---
  const handleInputChange = (e) => {
    setFormResidente({ ...formResidente, [e.target.name]: e.target.value });
  };

  

  const handleEditar = (residente) => {
  // Aquí 'residente' es el objeto del humano que pasamos desde la tabla
  setFormResidente({ 
    ...residente,
    // Necesitamos asegurar que el formulario sepa a qué unidad pertenece para el modo lectura
    numero_unidad: residente.propiedades?.[0]?.numero_unidad || '' 
  }); 
  setMostrarModal(true);       
};

// Función para el botón ASIGNAR (Nueva)
const handleAsignar = (propiedadId) => {
  // Buscamos la propiedad en nuestro estado actual
  const prop = residentes.find(p => p.id === propiedadId);
  
  if (prop) {
    setFormResidente({
      ...INITIAL_FORM_STATE,
      propiedad_id: prop.id,
      numero_unidad: prop.numero_unidad,
      prorrateo: prop.prorrateo
    });
    setMostrarModal(true);
  }
};

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormResidente(INITIAL_FORM_STATE);
    setUnidadExistente(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Aseguramos que los tipos de datos coincidan con el Schema de FastAPI
  const payload = {
    nombre: formResidente.nombre.trim(),
    // Si el email está vacío, enviamos null (EmailStr falla con strings vacíos "")
    email: formResidente.email?.trim() || null, 
    telefono: formResidente.telefono?.trim() || null,
    numero_unidad: String(formResidente.numero_unidad),
    comunidad_id: parseInt(id),
    prorrateo: parseFloat(formResidente.prorrateo) || 0,
    activo: 1 // Forzamos el estado activo al crear
  };

  try {
    if (formResidente.id) {
      await api.put(`/api/residentes/${formResidente.id}`, payload);
    } else {
      await api.post(`/api/residentes`, payload);
    }
    cerrarModal();
    cargarPropiedadesYResidentes(); 
  } catch (error) {
    // Si sigue dando 422, este alert te dirá exactamente qué campo falla
    console.error("Detalle del error 422:", error.response?.data?.detail);
    alert(`Error: ${JSON.stringify(error.response?.data?.detail)}`);
  }
};

  const handleEliminar = async (resId) => {
    if (!window.confirm("¿Confirmar eliminación del residente?")) return;
    try {
      await api.delete(`/api/residentes/${resId}`);
      if (residentes.length === 1 && page > 1) setPage(page - 1);
      else cargarPropiedadesYResidentes();
    } catch (error) {
      alert("No se pudo eliminar.");
    }
  };



  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-100 shadow-sm">
                <Users className="w-7 h-7 text-indigo-600" />
            </div>
            Padrón de Residentes
          </h1>
          <p className="text-gray-500 text-sm mt-2">Gestiona propietarios y unidades de la comunidad.</p>
        </div>
      </div>

      
      

      {/* BARRA DE HERRAMIENTAS */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar en esta página..."
            className="pl-9 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setMostrarModalImport(true)}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Importar CSV
          </button>
        </div>

       
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {cargando ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
             <p className="text-sm font-medium animate-pulse">Cargando datos...</p>
          </div>
        ) : residentes.length === 0 ? (
           <div className="p-16 text-center">
             <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-gray-900">Sin residentes registrados</h3>
           </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold">Unidad</th>
                    <th className="p-4 font-semibold">Nombre</th>
                    <th className="p-4 font-semibold">Contacto</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {residentes.map((prop, index) => {
                    // Extraemos al residente activo de la propiedad (si existe)
                    const residenteActivo = prop.residentes && prop.residentes.length > 0 ? prop.residentes[0] : null;

                    return (
                      <tr key={`${prop.id}-${index}`} className="hover:bg-gray-50/80 transition-colors group">
                        {/* Celda de la Unidad - Siempre visible */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Home className={`w-4 h-4 ${residenteActivo ? 'text-gray-400' : 'text-amber-400'}`} />
                            Unidad {prop.numero_unidad}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 ml-6">Coef: {prop.prorrateo}</div>
                        </td>

                        {/* Celda del Nombre - Condicional */}
                        <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {residenteActivo ? (
                            residenteActivo.nombre
                          ) : (
                            <span className="text-gray-300 font-normal italic">Sin asignar</span>
                          )}
                        </td>

                        {/* Celda de Contacto - Condicional */}
                        <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col gap-1">
                            {residenteActivo ? (
                              <>
                                {residenteActivo.email && (
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 opacity-70" /> {residenteActivo.email}
                                  </div>
                                )}
                                {residenteActivo.telefono && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Phone className="w-3.5 h-3.5 opacity-70" /> {residenteActivo.telefono}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Esperando residente</span>
                            )}
                          </div>
                        </td>

                        {/* Celda de Estado de Pago */}
                        <td className="p-4 whitespace-nowrap text-sm">
                          {residenteActivo ? (
                            <span className={`inline-block px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border 
                              ${prop.estado_pago === 'MOROSO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                              {prop.estado_pago === 'MOROSO' ? 'Moroso' : 'Al Día'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border bg-gray-50 text-gray-400 border-gray-200">
                              Vacante
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            {residenteActivo ? (
                              <>
                                <button onClick={() => handleEditar(residenteActivo)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleEliminar(residenteActivo.id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleAsignar(prop.id)} 
                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-indigo-100"
                              >
                                ASIGNAR
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
             
            {/* Paginación Premium - Corregida para ser visible siempre */}
            {totalItems > 0 && (
              <div className="px-6 py-2 bg-gray-50 border-t border-gray-200/80">
                <BotonPaginado
                  page={page} 
                  setPage={setPage} 
                  totalPages={totalPages || 1} 
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* MODAL FORMULARIO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {formResidente.id ? 'Editar Residente' : 'Nueva Unidad y Residente'}
                 </h2>
                 <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-700 p-1"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* SECCIÓN DE UBICACIÓN (Lectura o Búsqueda) */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Home className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Información de la Propiedad</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Unidad / Depto</label>
                    <input 
                      type="text" 
                      name="numero_unidad" 
                      value={formResidente.numero_unidad} 
                      onChange={handleInputChange} 
                      disabled={!!formResidente.id || !!formResidente.propiedad_id} // Bloqueado si viene de "Asignar" o es Edición
                      placeholder="Ej: 101" 
                      required 
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 disabled:bg-gray-100/50 disabled:text-gray-500" 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Prorrateo (%)</label>
                    <div className="w-full px-4 py-2 bg-gray-100/50 border border-gray-200 rounded-xl text-sm font-mono text-gray-500 flex items-center justify-between">
                      {formResidente.prorrateo || '0.000000'}
                      <Percent className="w-3 h-3 opacity-40" />
                    </div>
                  </div>
                </div>

                {/* Alerta visual si la unidad no existe en el sistema */}
                {!formResidente.id && !unidadExistente && formResidente.numero_unidad && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-600 font-medium animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    La unidad se creará automáticamente si no existe.
                  </div>
                )}
              </div>

              {/* SECCIÓN DE DATOS PERSONALES */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Nombre del Residente
                  </label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={formResidente.nombre} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Nombre completo"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formResidente.email} 
                      onChange={handleInputChange} 
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                    <input 
                      type="text" 
                      name="telefono" 
                      value={formResidente.telefono} 
                      onChange={handleInputChange} 
                      placeholder="+56 9..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={cerrarModal} 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  {formResidente.id ? 'Actualizar Datos' : 'Asignar Residente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE IMPORTACIÓN MASIVA */}
      <ImportarResidentesModal 
        isOpen={mostrarModalImport}
        onClose={() => setMostrarModalImport(false)}
        comunidadId={id}
        onImportSuccess={cargarPropiedadesYResidentes}
       />


    </div>
  );
}

export default ResidentesPage;