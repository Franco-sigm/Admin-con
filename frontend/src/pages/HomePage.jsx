import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

function HomePage() {
  const [comunidades, setComunidades] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [idEdicion, setIdEdicion] = useState(null)

  // 1. ESTADO ACTUALIZADO SEGÚN  BASE DE DATOS
  const [nuevaComunidad, setNuevaComunidad] = useState({
    nombre: '',
    direccion: '',
    tipo: 'Edificio', // Valor por defecto
    unidades_totales: ''
  })

  useEffect(() => {
    cargarComunidades()
  }, [])

  const cargarComunidades = async () => {
    try {
      const res = await client.get('/comunidades')
      setComunidades(res.data)
    } catch (error) {
      console.error("Error cargando comunidades:", error)
    }
  }

  const handleInputChange = (e) => {
    setNuevaComunidad({
      ...nuevaComunidad,
      [e.target.name]: e.target.value
    })
  }

 const guardarComunidad = async (e) => {
    e.preventDefault()
    
    // 1. Verificar qué datos vamos a enviar
    console.log("--- INTENTANDO GUARDAR ---")
    console.log("Modo:", idEdicion ? "EDITAR (PUT)" : "CREAR (POST)")
    console.log("ID a editar:", idEdicion)
    console.log("Datos del formulario:", nuevaComunidad)

    try {
      const datosAEnviar = {
        ...nuevaComunidad,
        unidades_totales: parseInt(nuevaComunidad.unidades_totales)
      }

      if (idEdicion) {
         // PUT
         console.log(`Enviando PUT a: /comunidades/${idEdicion}`)
         await client.put(`/comunidades/${idEdicion}`, datosAEnviar)
         alert("✅ ¡Comunidad actualizada correctamente!")
      } else {
         // POST
         console.log("Enviando POST a: /comunidades")
         await client.post('/comunidades', datosAEnviar)
         alert("✅ ¡Comunidad creada correctamente!")
      }
      
      setMostrarModal(false)
      setNuevaComunidad({ nombre: '', direccion: '', tipo: 'Edificio', unidades_totales: '' })
      setIdEdicion(null)
      cargarComunidades()

    } catch (error) {
      console.error("❌ ERROR GRAVE:", error)
      
      // ESTO ES LO IMPORTANTE: ¿Qué dice el servidor?
      if (error.response) {
          console.error("STATUS:", error.response.status) // Ej: 404, 500
          console.error("MENSAJE DEL SERVER:", error.response.data)
          alert(`Error del Servidor (${error.response.status}): Revisa la consola (F12)`)
      } else {
          alert("Error de conexión: El backend no responde o la URL está mal.")
      }
    }
  }
// 1. PREPARAR EDICIÓN: Llena el formulario con los datos de la tarjeta
  const cargarDatosEdicion = (e, comunidad) => {
    e.preventDefault() // <--- VITAL: Evita entrar al Link
    e.stopPropagation() // <--- VITAL: Doble seguridad

    setIdEdicion(comunidad.id) // Guardamos el ID que vamos a editar
    
    // Rellenamos el formulario visualmente
    setNuevaComunidad({
      nombre: comunidad.nombre,
      direccion: comunidad.direccion,
      tipo: comunidad.tipo,
      unidades_totales: comunidad.unidades_totales
    })
    
    setMostrarModal(true) // Abrimos el modal
  }

 // --- FUNCIÓN DEPURADA PARA ELIMINAR ---
  const eliminarComunidad = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("--- INTENTANDO ELIMINAR ---")
    console.log("ID recibido:", id) // <--- SI ESTO ES 'undefined', AHÍ ESTÁ EL ERROR

    if (!confirm("¿Estás seguro de eliminar?")) return

    try {
      console.log(`Enviando DELETE a: /comunidades/${id}`)
      await client.delete(`/comunidades/${id}`)
      
      setComunidades(comunidades.filter(c => c.id !== id))
      
    } catch (error) {
      console.error("❌ ERROR AL ELIMINAR:", error)
      if (error.response) {
        alert(`Error del Servidor (${error.response.status}): Posiblemente la ruta DELETE no existe.`)
      } else {
        alert("Error de conexión.")
      }
    }
  }

  return (
    
    
    <div className="container mx-auto p-10">
      
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Mis Condominios</h1>
           <p className="text-gray-500">Selecciona una comunidad para administrar</p>
        </div>
            <button 
                onClick={() => {
                  // Limpiamos datos viejos y quitamos el ID de edición
                  setNuevaComunidad({ nombre: '', direccion: '', tipo: 'Edificio', unidades_totales: '' })
                  setIdEdicion(null) 
                  setMostrarModal(true)
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-semibold"
              >
                + Nueva Comunidad
            </button>
      </div>
      {comunidades.length === 0 ? (
        
        // 1. SI ESTÁ VACÍO: Mostramos el cartel de bienvenida
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
           <div className="text-6xl mb-4">🏢</div>
           <h3 className="text-xl font-bold text-gray-700">Aún no hay comunidades</h3>
           <p className="text-gray-500 mt-2 text-center max-w-sm">
             ¡Bienvenido! Parece que aún no has agregado ningún condominio. <br/>
             Haz clic en el botón <strong>"+ Nueva Comunidad"</strong> para comenzar a administrar tus comunidades.
           </p>
        </div>

      ) : (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {comunidades.map(comunidad => (
          <Link key={comunidad.id} to={`/comunidad/${comunidad.id}/residentes`} className="block group h-full relative">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden h-full flex flex-col">
                      {/* --- BOTONES DE ACCIÓN (FLOTANTES) --- */}
              <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Botón Editar */}
                  <button 
                    onClick={(e) => cargarDatosEdicion(e, comunidad)}
                    className="bg-white p-2 rounded-full shadow hover:bg-yellow-100 text-yellow-600 transition"
                    title="Editar"
                  >
                    ✏️
                  </button>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={(e) => eliminarComunidad(e, comunidad.id)}
                    className="bg-white p-2 rounded-full shadow hover:bg-red-100 text-red-600 transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
              </div>
              {/* Encabezado de color según el TIPO */}
              <div className={`h-24 flex items-center justify-center text-white text-4xl
                ${comunidad.tipo === 'Casa' ? 'bg-green-500' : 'bg-gray-600'}`}>
                 {comunidad.tipo === 'Casa' ? '🏡' : '🏢'}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{comunidad.nombre}</h3>
                  <p className="text-gray-500 text-sm mb-1">📍 {comunidad.direccion}</p>
                  
                  {/* Badge de Tipo */}
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                    {comunidad.tipo}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                   <span className="text-gray-400">{comunidad.unidades_totales} Unidades</span>
                   <span className="text-blue-600 font-medium">Entrar →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}

      
      
      
      {/* --- MODAL DE CREACIÓN de nueva comunidad --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
           <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">
              {idEdicion ? 'Editar Comunidad' : 'Nueva Comunidad'}
            </h3>
            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
          </div>  

            <form onSubmit={guardarComunidad} className="p-6">
              
              {/* CAMPO 1: NOMBRE */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  placeholder="Ej: Edificio Central"
                  value={nuevaComunidad.nombre} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                  autoFocus
                />
              </div>

              {/* CAMPO 2: DIRECCIÓN */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  placeholder="Ej: Calle Principal 123"
                  value={nuevaComunidad.direccion} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required 
                />
              </div>

              {/* CAMPO 3: TIPO (Select) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comunidad</label>
                <select
                  name="tipo"
                  value={nuevaComunidad.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Edificio">🏢 Edificio</option>
                  <option value="Condominio Casas">🏡 Condominio de Casas</option>
                  <option value="Oficinas">💼 Oficinas</option>
                </select>
              </div>

              {/* CAMPO 4: UNIDADES TOTALES (Number) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Unidades</label>
                <input 
                  type="number" 
                  name="unidades_totales"
                  placeholder="Ej: 50"
                  value={nuevaComunidad.unidades_totales} 
                  onChange={handleInputChange} 
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancelar
                </button>
              {/* --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE --- */}
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                >
                  {idEdicion ? 'Guardar Cambios' : 'Crear Comunidad'}
                </button>
                {/* -------------------------------------- */}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default HomePage