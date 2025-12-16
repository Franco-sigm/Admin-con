import { useEffect, useState } from 'react'
import client from '../api/client'

function ResidentesPage() {
  const [residentes, setResidentes] = useState([])
  const [cargando, setCargando] = useState(true)
  
  // Estado para el Modal y el Formulario
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoResidente, setNuevoResidente] = useState({
    comunidad_id: '',// Asumimos que trabajarás en la comunidad 1 por ahora
    nombre_completo: '',
    unidad: '',
    telefono: '',
    estado_pago: '',
  })

  // Cargar datos al inicio
  useEffect(() => {
    cargarResidentes()
  }, [])

  const cargarResidentes = async () => {
    try {
      const respuesta = await client.get('/residentes')
      setResidentes(respuesta.data)
      setCargando(false)
    } catch (error) {
      console.error("Error cargando:", error)
      setCargando(false)
    }
  }

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    setNuevoResidente({
      ...nuevoResidente,
      [e.target.name]: e.target.value
    })
  }

  // Enviar datos al Backend
  const crearResidente = async (e) => {
    e.preventDefault() // Evitar que se recargue la página
    try {
      await client.post('/residentes', nuevoResidente)
      
      // Si funciona: cerramos modal, limpiamos form y recargamos lista
      setMostrarModal(false)
      setNuevoResidente({comunidad_id: '', nombre_completo: '', unidad: '', telefono: '', estado_pago: ''})
      cargarResidentes() // ¡Recarga mágica sin F5!
      alert("Residente creado con éxito ✨")
      
    } catch (error) {
      console.error("Error creando:", error)
      alert("Error al crear residente. Revisa la consola.")
    }
  }

  return (
    <div className="mt-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">👥 Gestión de Residentes</h2>
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition"
        >
          + Nuevo Residente
        </button>
      </div>

      {/* --- TABLA (Igual que antes) --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando datos... ⏳</div>
        ) : (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unidad</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody>
              {residentes.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{res.comunidad_id}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{res.nombre_completo}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">{res.unidad}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm text-gray-500">{res.telefono}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{res.nombre_completo}</td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{res.estado_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL (Ventana Flotante) --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Agregar Nuevo Residente</h3>
            <form onSubmit={crearResidente}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre_completo"
                  value={nuevoResidente.nombre_completo}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Unidad (Depto/Casa)</label>
                <input 
                  type="text" 
                  name="unidad"
                  value={nuevoResidente.unidad}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={nuevoResidente.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required 
                />
              </div>
              
              {/* Botones de Acción */}
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Guardar
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