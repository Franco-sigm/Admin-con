import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

// --- ICONOS SVG ELEGANTES (Incrustados para no depender de librerías) ---
const Icons = {
  Building: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h1.5M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Empty: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  )
}
// -----------------------------------------------------------------

function HomePage() {
  const [comunidades, setComunidades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [idEdicion, setIdEdicion] = useState(null)

  const [nuevaComunidad, setNuevaComunidad] = useState({
    nombre: '',
    direccion: '',
    tipo: 'Edificio',
    unidades_totales: ''
  })

  useEffect(() => {
    cargarComunidades()
  }, [])

  const cargarComunidades = async () => {
    try {
      setCargando(true)
      const res = await client.get('/api/comunidades/')
      // Blindaje: Nos aseguramos de que siempre se guarde un Array, incluso si la API falla
      setComunidades(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error cargando comunidades:", error)
      setComunidades([]) // Si hay error de red, mostramos estado vacío en lugar de explotar
    } finally {
      setCargando(false)
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
    
    try {
      const datosAEnviar = {
        ...nuevaComunidad,
        unidades_totales: parseInt(nuevaComunidad.unidades_totales) || 0
      }

      if (idEdicion) {
         await client.put(`/api/comunidades/${idEdicion}`, datosAEnviar)
         alert("✅ Comunidad actualizada")
      } else {
         await client.post('/api/comunidades/', datosAEnviar)
         alert("✅ Comunidad creada")
      }
      
      setMostrarModal(false)
      setNuevaComunidad({ nombre: '', direccion: '', tipo: 'Edificio', unidades_totales: '' })
      setIdEdicion(null)
      cargarComunidades()

    } catch (error) {
      console.error("Error al guardar:", error)
      const msg = error.response?.data?.detail || "Ocurrió un error inesperado al guardar";
      alert(`Error: ${msg}`)
    }
  }

  const cargarDatosEdicion = (e, comunidad) => {
    e.preventDefault() 
    e.stopPropagation() 

    setIdEdicion(comunidad.id)
    setNuevaComunidad({
      nombre: comunidad.nombre,
      direccion: comunidad.direccion,
      tipo: comunidad.tipo || 'Edificio',
      unidades_totales: comunidad.unidades_totales
    })
    setMostrarModal(true)
  }

  const eliminarComunidad = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm("¿Estás seguro? Se borrarán también los residentes y datos asociados.")) return

    try {
      await client.delete(`/api/comunidades/${id}`)
      setComunidades(prev => prev.filter(c => c.id !== id))
      alert("🗑️ Comunidad eliminada")
    } catch (error) {
      console.error("Error eliminando:", error)
      alert("No se pudo eliminar la comunidad.")
    }
  }

  const abrirModalNuevo = () => {
      setNuevaComunidad({ nombre: '', direccion: '', tipo: 'Edificio', unidades_totales: '' })
      setIdEdicion(null) 
      setMostrarModal(true)
  }

  // Helper para renderizar el icono correcto
  const renderIcono = (tipo) => {
      switch (tipo) {
          case 'Condominio Casas': return <Icons.Home />;
          case 'Oficinas': return <Icons.Briefcase />;
          default: return <Icons.Building />;
      }
  }

  return (
    <div className="container mx-auto p-4 md:p-10 animate-fade-in-down">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Condominios</h1>
           <p className="text-gray-500 mt-1">Comienza creando el espacio de administración de tu comunidad</p>
        </div>
        <button 
           onClick={abrirModalNuevo}
           className="px-6 py-3 bg-[oklch(50%_0.134_242.749)] hover:bg-black text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
        >
           <span>+</span> Crear Comunidad
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {cargando ? (
         <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
         </div>
      ) : (!Array.isArray(comunidades) || comunidades.length === 0) ? (
        
        // ESTADO VACÍO (Elegante y Blindado)
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
           {Icons.Empty()} 
           <h3 className="text-lg font-semibold text-gray-900 mt-4">No tienes comunidades</h3>
           <p className="text-gray-500 mt-2 text-center max-w-sm text-sm">
             Comienza creando tu primera comunidad para gestionar residentes, finanzas y más.
           </p>
           <button 
              onClick={abrirModalNuevo} 
              className="mt-6 text-indigo-600 font-medium hover:text-indigo-800 text-sm"
            >
              Crear mi primera comunidad &rarr;
           </button>
        </div>

      ) : (

      // GRILLA DE TARJETAS (Diseño Premium)
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {comunidades.map(comunidad => (
          <Link key={comunidad.id} to={`/comunidad/${comunidad.id}`} className="block group h-full relative no-underline">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
              
              {/* BOTONES FLOTANTES */}
              <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => cargarDatosEdicion(e, comunidad)}
                    className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 border border-gray-200 transition"
                    title="Editar"
                  >
                    <Icons.Edit />
                  </button>
                  <button 
                    onClick={(e) => eliminarComunidad(e, comunidad.id)}
                    className="bg-white p-2 rounded-lg shadow-sm hover:bg-red-50 text-red-500 border border-gray-200 transition"
                    title="Eliminar"
                  >
                    <Icons.Trash />
                  </button>
              </div>

              {/* ENCABEZADO MINIMALISTA */}
              <div className={`h-32 flex items-center justify-center text-white
                ${comunidad.tipo === 'Condominio Casas' ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-gradient-to-br from-slate-700 to-gray-900'}`}>
                 <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    {renderIcono(comunidad.tipo)}
                 </div>
              </div>

              {/* CUERPO DE LA TARJETA */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{comunidad.nombre}</h3>
                      <span className="shrink-0 bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider border border-gray-200">
                        {comunidad.tipo}
                      </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {comunidad.direccion}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2 text-gray-500 font-medium">
                     <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 font-bold">{comunidad.unidades_totales}</span>
                     <span>Unidades</span>
                   </div>
                   <span className="text-[oklch(50%_0.134_242.749)] font-semibold group-hover:translate-x-1 transition-transform text-xs uppercase tracking-wide">
                     Ingresar a unidad &rarr;
                   </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}

      {/* --- MODAL (Diseño Limpio) --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setMostrarModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-down" onClick={e => e.stopPropagation()}>
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
             <div>
                <h3 className="text-xl font-bold text-gray-900">
                {idEdicion ? 'Editar Comunidad' : 'Nueva Comunidad'}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Ingresa los detalles del condominio</p>
             </div>
             <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
             </button>
           </div>  

            <form onSubmit={guardarComunidad} className="p-8 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Condominio</label>
                <input 
                  type="text" 
                  name="nombre"
                  placeholder="Ej: Edificio Los Leones"
                  value={nuevaComunidad.nombre} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition text-gray-800 placeholder-gray-400"
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  placeholder="Ej: Av. Providencia 1234"
                  value={nuevaComunidad.direccion} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition text-gray-800 placeholder-gray-400"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                    <div className="relative">
                        <select
                        name="tipo"
                        value={nuevaComunidad.tipo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none bg-white appearance-none text-gray-800"
                        >
                        <option value="Edificio">Edificio</option>
                        <option value="Condominio Departamentos">Condominio Departamentos</option>
                        <option value="Condominio Casas">Casas</option>
                        <option value="Oficinas">Oficinas</option>
                        </select>
                        {/* Flecha custom */}
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">N° Unidades</label>
                    <input 
                      type="number" 
                      name="unidades_totales"
                      placeholder="Ej: 50"
                      value={nuevaComunidad.unidades_totales} 
                      onChange={handleInputChange} 
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition text-gray-800"
                      required
                    />
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-2">
                <button 
                  type="button" 
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition font-medium text-sm"
                >
                  Cancelar
                </button>
            
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[oklch(50%_0.134_242.749)] hover:bg-black text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-sm"
                >
                  {idEdicion ? 'Guardar Cambios' : 'Crear Comunidad'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default HomePage