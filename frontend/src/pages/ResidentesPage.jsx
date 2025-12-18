import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' 
import client from '../api/client'

function ResidentesPage() {
  const { id } = useParams() 
  
  const [residentes, setResidentes] = useState([])
  const [idEdicion, setIdEdicion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [formResidente, setFormResidente] = useState({
    id: null,
    nombre: '',
    unidad: '',
    email: '',
    telefono: '',
    estado_pago: 'AL_DIA'
  })

  

 
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
    } finally {
      setCargando(false)
    }
  }

  // --- MANEJO DEL FORMULARIO (CORREGIDO) ---
  
  // 1. INPUT CHANGE: Ahora actualiza 'formResidente' (NO 'nuevoResidente')
  const handleInputChange = (e) => {
    setFormResidente({
      ...formResidente,
      [e.target.name]: e.target.value
    })
  }

  // 2. PREPARAR EDICIÓN
  const handleEditar = (residente) => {
    console.log("✏️ Click en Editar. Datos:", residente)
    if (!residente.id) alert("⚠️ ALERTA: Residente sin ID.")
    
    setFormResidente(residente) 
    setMostrarModal(true)       
  }

  // 3. CERRAR MODAL Y LIMPIAR
  const cerrarModal = () => {
    setMostrarModal(false)
    // Reseteamos el formulario único
    setFormResidente({ id: null, nombre: '', unidad: '', email: '', telefono: '', estado_pago: 'AL_DIA' })
  }

  // 4. GUARDAR MAESTRO (Crea o Edita según corresponda)
  // Nota: Eliminé la función 'crearResidente' porque esta ya hace todo.
  const handleSubmit = async (e) => {
    e.preventDefault()
    const comunidadIdNum = parseInt(id) 

    console.log("💾 Guardando:", formResidente)

    try {
      const datosAEnviar = { 
        nombre: formResidente.nombre,
        unidad: formResidente.unidad,
        email: formResidente.email,
        telefono: formResidente.telefono,
        estado_pago: formResidente.estado_pago,
        comunidad_id: comunidadIdNum
      }

      if (formResidente.id) {
        // --- EDITAR (PUT) ---
        console.log(`🔄 Editando ID: ${formResidente.id}`)
        await client.put(`/residentes/${formResidente.id}`, datosAEnviar)
        alert("✅ Actualizado correctamente")
      } else {
        // --- CREAR (POST) ---
        console.log("✨ Creando nuevo")
        await client.post('/residentes', datosAEnviar)
        alert("✅ Creado correctamente")
      }
      
      cerrarModal()     // Cierra y limpia
      cargarResidentes() // Recarga la tabla
      
    } catch (error) {
      console.error("❌ Error guardando:", error)
      alert("Error al guardar. Revisa la consola.")
    }
  }

  // --- ELIMINAR ---
  const handleEliminar = async (residenteId) => {
    if (!window.confirm("¿Seguro de eliminar?")) return;

    try {
      await client.delete(`/residentes/${residenteId}`)
      alert("🗑️ Eliminado")
      cargarResidentes()
    } catch (error) {
      console.error("❌ Error eliminando:", error)
      alert("Error al eliminar.")
    }
  }
  return (
    <div className="mt-2 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">👥 Padrón de Residentes</h2>
            <p className="text-gray-500 text-sm">Listado de propietarios y arrendatarios</p>
        </div>
        <button 
          onClick={() => { 
            // 1. Limpiamos el formulario usando la variable CORRECTA (formResidente)
            setFormResidente({ 
                id: null, // Importante: null significa "Crear Nuevo"
                nombre: '', 
                unidad: '', 
                email: '', 
                telefono: '', 
                estado_pago: 'AL_DIA' 
            }); 
            // 2. Abrimos el modal
            setMostrarModal(true); 
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex items-center gap-2"
        >
          <span>+</span> Nuevo Residente
        </button>
      </div>

      {/* TABLA DE 5 COLUMNAS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-400"><p>Cargando datos...</p></div>
        ) : residentes.length === 0 ? (
           <div className="p-12 text-center text-gray-400"><p>Aún no hay residentes.</p></div>
        ) : (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Unidad</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 border-b border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {residentes.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 whitespace-no-wrap text-sm font-bold text-gray-700">{res.unidad}</td>
                  
                  <td className="px-5 py-4 whitespace-no-wrap text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        {res.nombre}
                      </div>
                  </td>

                  {/* Nueva Columna Email */}
                  <td className="px-5 py-4 whitespace-no-wrap text-sm text-gray-500">{res.email || '-'}</td>

                  <td className="px-5 py-4 whitespace-no-wrap text-sm text-gray-500">{res.telefono || '-'}</td>

                  <td className="px-5 py-4 whitespace-no-wrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${res.estado_pago === 'MOROSO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {res.estado_pago === 'MOROSO' ? 'Moroso' : 'Al Día'}
                    </span>
                  </td>
                  {/* --- NUEVA COLUMNA DE BOTONES --- */}
                  
                  <td className="px-5 py-4 whitespace-no-wrap text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                        {/* Botón Editar */}
                        <button 
                          onClick={() => handleEditar(res)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        
                        {/* Botón Eliminar */}
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
        )}
      </div>

      {/* --- MODAL --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800"></h3>
                   {formResidente.id ? 'Editar Residente' : 'Nuevo Residente'}

            </div>
            
           <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* CAMPO 1: NOMBRE */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Nombre</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={formResidente.nombre} // ✅ Correcto
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required placeholder="Ej: Juan Pérez" 
                />
              </div>

              {/* CAMPO 2: UNIDAD */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Unidad</label>
                <input 
                  type="text" 
                  name="unidad" 
                  value={formResidente.unidad} // ✅ Cambiado de nuevoResidente a formResidente
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required placeholder="Ej: 104-B" 
                />
              </div>

              {/* CAMPO 3: EMAIL */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formResidente.email} // ✅ Cambiado de nuevoResidente a formResidente
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="juan@correo.com" 
                />
              </div>

              {/* CAMPO 4: TELÉFONO */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono" 
                  value={formResidente.telefono} // ✅ Cambiado de nuevoResidente a formResidente
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+56 9 ..." 
                />
              </div>

               {/* CAMPO 5: ESTADO PAGO */}
               <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Estado Pago</label>
                <select 
                  name="estado_pago" 
                  value={formResidente.estado_pago} // ✅ Cambiado de nuevoResidente a formResidente
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="AL_DIA">Al Día</option>
                  <option value="MOROSO">Moroso</option>
                </select>
              </div>
              
              {/* 2. BOTONES DINÁMICOS */}
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition font-bold"
                >
                  {/* ¿Tiene ID? Cambiamos el texto del botón */}
                  {formResidente.id ? 'Actualizar Cambios' : 'Guardar Residente'}
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