import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' 
import api from '../api/client' 

const INITIAL_FORM_STATE = {
  id: null,
  nombre: '',
  numero_unidad: '', // Estandarizado
  prorrateo: '',     // Agregado
  email: '',
  telefono: '',
  propiedad_id: null
}

function ResidentesPage() {
  const { id } = useParams() 
  
  const [residentes, setResidentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [formResidente, setFormResidente] = useState(INITIAL_FORM_STATE)

  // --- CARGAR DATOS ---
  useEffect(() => {
    if (id) cargarPropiedadesYResidentes()
  }, [id])

  const cargarPropiedadesYResidentes = async () => {
    try {
      setCargando(true)
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }
      
      const respuesta = await api.get(`/api/residentes/comunidad/${id}`, config)
      console.log("🕵️‍♂️ DATOS DEL BACKEND:", respuesta.data)

      if (Array.isArray(respuesta.data)) {
          // Usamos flatMap para "desenrollar" a los residentes con múltiples propiedades
          const datosFormateados = respuesta.data.flatMap(res => {
              
              // Si el residente tiene propiedades, creamos una fila por cada una
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
                  }))
              } else {
                  // Respaldo por si hay un residente "huérfano" sin propiedad asignada
                  return [{
                      id: res.id, 
                      propiedad_id: null,          
                      numero_unidad: 'Sin Unidad',
                      prorrateo: 0,
                      nombre: res.nombre,
                      email: res.email || '',
                      telefono: res.telefono || '',
                      estado_pago: res.estado_pago || 'AL_DIA' 
                  }]
              }
          })
          
          setResidentes(datosFormateados)
      } else {
          setResidentes([])
      }

    } catch (error) {
      console.error("Error cargando la lista:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
          alert("Sesión expirada o sin permisos. Por favor, inicia sesión de nuevo.")
      }
    } finally {
      setCargando(false)
    }
  }

  const [unidadExistente, setUnidadExistente] = useState(null);


useEffect(() => {
  // Buscamos si la unidad escrita ya existe en la lista de residentes/propiedades cargadas
  if (!formResidente.id && formResidente.numero_unidad) {
    const coincidencia = residentes.find(
      r => r.numero_unidad?.toLowerCase() === formResidente.numero_unidad.toLowerCase()
    );
    
    if (coincidencia) {
      setUnidadExistente(coincidencia);
      // Seteamos automáticamente el prorrateo de la unidad que ya existe
      setFormResidente(prev => ({ ...prev, prorrateo: coincidencia.prorrateo }));
    } else {
      setUnidadExistente(null);
    }
  }
}, [formResidente.numero_unidad, residentes, formResidente.id]);

  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    setFormResidente({
      ...formResidente,
      [e.target.name]: e.target.value
    })
  }

  const handleEditar = (residente) => {
    // Cargamos los datos en el modal
    setFormResidente({
      ...residente,
      prorrateo: residente.prorrateo // Aseguramos que pase el dato para mostrarlo deshabilitado
    }) 
    setMostrarModal(true)       
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setFormResidente(INITIAL_FORM_STATE)
  }

 const handleSubmit = async (e) => {
  e.preventDefault();
  const comunidadIdNum = parseInt(id);
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    if (formResidente.id && formResidente.propiedad_id) {
      // --- MODO EDICIÓN ---
      await api.put(`/api/residentes/${formResidente.id}`, {
        nombre: formResidente.nombre,
        email: formResidente.email,
        telefono: formResidente.telefono,
        propiedad_id: formResidente.propiedad_id
      }, config);
      alert("✅ Residente actualizado");
    } else {
      // --- MODO CREACIÓN (Lógica Inteligente) ---
      
      // 1. Verificar si la propiedad ya existe en esta comunidad
      const resBusqueda = await api.get(`/api/propiedades/comunidad/${comunidadIdNum}`, config);
      
      const propiedadesExistentes = resBusqueda.data;
      
      let propiedadDestino = propiedadesExistentes.find(
        p => p.numero_unidad.toLowerCase() === formResidente.numero_unidad.toLowerCase()
      );

      let propiedadIdFinal;

      if (propiedadDestino) {
        // La propiedad ya existe, usamos su ID
        propiedadIdFinal = propiedadDestino.id;
        console.log("Usando propiedad existente ID:", propiedadIdFinal);
      } else {
        // La propiedad NO existe, la creamos
        const resNuevaProp = await api.post(`/api/propiedades`, {
          numero_unidad: formResidente.numero_unidad,
          prorrateo: parseFloat(formResidente.prorrateo) || 0,
          comunidad_id: comunidadIdNum
        }, config);
        propiedadIdFinal = resNuevaProp.data.id;
        console.log("Nueva propiedad creada ID:", propiedadIdFinal);
      }

      // 2. Crear al residente vinculado a la propiedad (sea nueva o vieja)
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
    if (!window.confirm("¿Eliminar residente y liberar la unidad?")) return;

    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }

    try {
      if(residenteId) {
          await api.delete(`/api/residentes/${residenteId}`, config)
          alert("🗑️ Residente eliminado. La unidad ahora está vacía.")
      } else {
          await api.delete(`/api/propiedades/${propiedadId}`, config)
          alert("🗑️ Unidad física eliminada.")
      }
      
      cargarPropiedadesYResidentes()
    } catch (error) {
      console.error("❌ Error eliminando:", error)
      alert("No se pudo eliminar.")
    }
  }

  const [busqueda, setBusqueda] = useState('');

  const residentesFiltrados = residentes.filter((res) => {
    const textoBusqueda = busqueda.toLowerCase();
    const nombre = res.nombre?.toLowerCase() || '';
    const unidad = res.numero_unidad?.toLowerCase() || '';
    return nombre.includes(textoBusqueda) || unidad.includes(textoBusqueda);
  });

  return (
    <div className="mt-2 relative p-4 animate-fade-in-down">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Padrón de Residentes</h2>
            <p className="text-gray-500 text-sm">Gestiona los propietarios de la comunidad</p>
        </div>

        {/* BARRA DE BÚSQUEDA UI */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            placeholder="Buscar por nombre o unidad..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { 
            setFormResidente(INITIAL_FORM_STATE); 
            setMostrarModal(true); 
          }}
          className="bg-[oklch(50%_0.134_242.749)] hover:bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <span>+</span> Nuevo Residente
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
             <p>Cargando datos...</p>
          </div>
        ) : residentes.length === 0 ? (
           <div className="p-12 text-center text-gray-400">
             <p className="text-4xl mb-2">📂</p>
             <p>Aún no hay residentes registrados.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {residentesFiltrados.map((res) => (
                  <tr key={res.propiedad_id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-700">Depto {res.numero_unidad}</div>
                        <div className="text-xs text-gray-400 font-mono">Coef: {res.prorrateo}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {res.nombre}
                        {!res.id && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Vacío</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                            <span>{res.email || '-'}</span>
                            <span className="text-xs text-gray-400">{res.telefono}</span>
                        </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${res.estado_pago === 'MOROSO' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                        {res.estado_pago === 'MOROSO' ? 'Moroso' : 'Al Día'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditar(res)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition" title="Editar Residente">✏️</button>
                        <button onClick={() => handleEliminar(res.id, res.propiedad_id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL (formulario de ingreso de residentes) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={cerrarModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-800">{formResidente.id ? 'Editar Residente' : 'Nueva Unidad y Residente'}</h3>
                 <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Solo mostramos los campos habilitados si es nuevo */}
              {!formResidente.id && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-xs font-bold mb-1">Unidad (Depto/Casa)</label>
                        <input 
                          type="text" 
                          name="numero_unidad" 
                          value={formResidente.numero_unidad} 
                          onChange={handleInputChange} 
                          placeholder="Ej: 101" 
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                            unidadExistente ? 'border-blue-400 bg-blue-50' : 'border-gray-300 focus:ring-indigo-500'
                          }`} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs font-bold mb-1">Prorrateo (Decimal)</label>
                        <input 
                          type="number" 
                          step="0.000001"
                          name="prorrateo" 
                          value={formResidente.prorrateo} 
                          onChange={handleInputChange} 
                          placeholder="Ej: 0.025" 
                          disabled={!!unidadExistente} // Se bloquea si la unidad ya existe
                          className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
                            unidadExistente ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-indigo-500'
                          }`} 
                          required 
                        />
                      </div>
                    </div>
                    
                    {/* Mensaje de aviso inteligente */}
                    {unidadExistente && (
                      <div className="flex items-center gap-2 text-blue-600 text-[10px] bg-blue-50 p-2 rounded-lg border border-blue-100 animate-pulse">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Esta unidad ya existe. Se vinculará el residente y se mantendrá el prorrateo actual.</span>
                      </div>
                    )}
                  </div>
                )}

              {/* Si estamos editando, mostramos la unidad y el prorrateo bloqueados */}
              {formResidente.id && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1">Unidad</label>
                      <input type="text" value={formResidente.numero_unidad} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-medium" />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs font-bold mb-1">Prorrateo</label>
                      <input type="text" value={formResidente.prorrateo} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500 font-mono" />
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1">Nombre Completo del Residente</label>
                <input type="text" name="nombre" value={formResidente.nombre} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1">Email</label>
                    <input type="email" name="email" value={formResidente.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1">Teléfono</label>
                    <input type="text" name="telefono" value={formResidente.telefono} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={cerrarModal} className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-[oklch(50%_0.134_242.749)] text-white rounded-lg font-bold hover:shadow-lg transition">
                  {formResidente.id ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResidentesPage