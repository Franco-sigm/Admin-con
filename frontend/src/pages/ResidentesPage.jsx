import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' 
import client from '../api/client'

// Estado inicial del formulario para reutilizarlo al limpiar
const INITIAL_FORM_STATE = {
  id: null,
  nombre: '',
  unidad: '',
  email: '',
  telefono: '',
  estado_pago: 'AL_DIA'
}

function ResidentesPage() {
  const { id } = useParams() 
  
  const [residentes, setResidentes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [formResidente, setFormResidente] = useState(INITIAL_FORM_STATE)

  // --- CARGAR DATOS ---
  useEffect(() => {
    if (id) cargarResidentes()
  }, [id])

  const cargarResidentes = async () => {
    try {
      setCargando(true)
      const respuesta = await client.get(`/residentes?comunidad_id=${id}`)
      setResidentes(respuesta.data)
    } catch (error) {
      console.error("Error cargando:", error)
      alert("Error al cargar la lista de residentes")
    } finally {
      setCargando(false)
    }
  }

  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    setFormResidente({
      ...formResidente,
      [e.target.name]: e.target.value
    })
  }

  const handleEditar = (residente) => {
    setFormResidente(residente) 
    setMostrarModal(true)       
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setFormResidente(INITIAL_FORM_STATE) // Reseteamos al estado inicial limpio
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const comunidadIdNum = parseInt(id) 

    try {
      const datosAEnviar = { ...formResidente, comunidad_id: comunidadIdNum }

      if (formResidente.id) {
        // --- EDITAR (PUT) ---
        await client.put(`/residentes/${formResidente.id}`, datosAEnviar)
        // Opcional: Feedback visual más sutil (Toast) en el futuro
        alert("✅ Residente actualizado correctamente")
      } else {
        // --- CREAR (POST) ---
        await client.post(`/residentes/${id}`, datosAEnviar)
        alert("✅ Residente creado correctamente")
      }
      
      cerrarModal()     
      cargarResidentes() 
      
    } catch (error) {
      console.error("❌ Error guardando:", error)
      alert("Hubo un error al guardar. Por favor intenta nuevamente.")
    }
  }

  const handleEliminar = async (residenteId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar a este residente? Esta acción no se puede deshacer.")) return;

    try {
      await client.delete(`/residentes/${residenteId}`)
      alert("🗑️ Residente eliminado")
      cargarResidentes()
    } catch (error) {
      console.error("❌ Error eliminando:", error)
      alert("No se pudo eliminar el residente.")
    }
  }

  return (
    <div className="mt-2 relative p-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">👥 Padrón de Residentes</h2>
            <p className="text-gray-500 text-sm">Gestiona los propietarios y arrendatarios de la comunidad</p>
        </div>
        <button 
          onClick={() => { 
            setFormResidente(INITIAL_FORM_STATE); 
            setMostrarModal(true); 
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <span>+</span> Nuevo Residente
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
             {/* Spinner simple con Tailwind */}
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-2"></div>
             <p>Cargando datos...</p>
          </div>
        ) : residentes.length === 0 ? (
           <div className="p-12 text-center text-gray-400">
             <p className="text-4xl mb-2">📂</p>
             <p>Aún no hay residentes registrados en esta comunidad.</p>
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
                {residentes.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{res.unidad}</td>
                    
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{res.nombre}</td>

                    {/* Combiné Email y Teléfono para ahorrar espacio horizontal en móviles */}
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
                        <button 
                          onClick={() => handleEditar(res)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleEliminar(res.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {mostrarModal && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cerrarModal} // Click afuera cierra el modal
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-down"
            onClick={(e) => e.stopPropagation()} // Click adentro NO cierra el modal
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-800">
                    {formResidente.id ? 'Editar Residente' : 'Nuevo Residente'}
                 </h3>
                 <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Agrupamos inputs para mejorar la visual */}
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wide">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formResidente.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required placeholder="Ej: Juan Pérez" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wide">Unidad</label>
                    <input 
                      type="text" 
                      name="unidad" 
                      value={formResidente.unidad}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      required placeholder="Ej: 104-B" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wide">Estado Pago</label>
                    <select 
                      name="estado_pago" 
                      value={formResidente.estado_pago}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="AL_DIA">Al Día</option>
                      <option value="MOROSO">Moroso</option>
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formResidente.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="juan@correo.com" 
                />
              </div>

              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1 uppercase tracking-wide">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono" 
                  value={formResidente.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+56 9 ..." 
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition font-medium"
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition font-bold"
                >
                  {formResidente.id ? 'Guardar Cambios' : 'Crear Residente'}
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