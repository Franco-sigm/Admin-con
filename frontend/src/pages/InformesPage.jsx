import { useState, useRef } from 'react' // 1. Importamos useRef
import { useParams } from 'react-router-dom' 
import api from '../api/client' 
import { useReactToPrint } from 'react-to-print' // 2. Importamos el hook de impresión
import InformeDocumento from '../components/InformeDocumento' // 3. Importamos el componente visual

const InformesPage = () => {
  const { id } = useParams(); 
  
  // Estado para los filtros (Igual que antes)
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    tipo: 'balance_mensual'
  });
  
  // Nuevo estado para guardar los DATOS que llegan del backend
  const [datosInforme, setDatosInforme] = useState(null); 
  const [loading, setLoading] = useState(false);

  // Referencia para saber qué imprimir
  const componentRef = useRef();

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setDatosInforme(null); // Limpiamos la vista previa si cambian los filtros
  };

  // --- CAMBIO PRINCIPAL: BUSCAR DATOS (NO DESCARGAR ARCHIVO) ---
  const handleBuscarDatos = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { 
        ...filtros, 
        comunidad_id: id 
      };

      // 1. Petición normal JSON (Ya no usamos responseType: 'blob')
      // Asegúrate de usar la ruta nueva '/informes/datos'
      const response = await api.post('/informes/datos', payload);

      // 2. Guardamos los datos en el estado para que React los pinte
      setDatosInforme(response.data);

    } catch (error) {
      console.error("Error buscando datos:", error);
      alert("❌ Error al obtener los datos. Revisa el backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- HOOK DE IMPRESIÓN ---
  const handlePrint = useReactToPrint({
    content: () => componentRef.current, // Imprime lo que esté en la referencia
    documentTitle: `Informe_${filtros.tipo}_${filtros.mes}-${filtros.anio}`,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* Encabezado */}
      <div className="mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">📊 Generación de Informes</h1>
        <p className="text-gray-600 mt-2">Genera una vista previa y descarga el PDF oficial.</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (Controles) */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Configuración</h2>
            
            <form onSubmit={handleBuscarDatos} className="space-y-6">
              {/* Selección de Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                <select 
                  name="tipo" 
                  value={filtros.tipo} 
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="balance_mensual">💰 Balance Financiero</option>
                  <option value="lista_residentes">👥 Nómina de Residentes</option>
                </select>
              </div>

              {/* Filtros de Fecha */}
              {filtros.tipo === 'balance_mensual' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                    <select 
                      name="mes" 
                      value={filtros.mes} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    >
                      {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((mes, i) => (
                        <option key={i} value={i+1}>{mes}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <input 
                      type="number" 
                      name="anio" 
                      value={filtros.anio} 
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-3">
                {/* Botón 1: Buscar Datos */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-bold transition duration-200 
                    ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {loading ? "Cargando datos..." : "🔍 1. Generar Vista Previa"}
                </button>

                {/* Botón 2: Imprimir (Solo aparece si hay datos) */}
                {datosInforme && (
                  <button 
                    type="button" 
                    onClick={handlePrint}
                    className="w-full py-3 px-4 rounded-lg text-white font-bold bg-green-600 hover:bg-green-700 shadow-md flex justify-center items-center gap-2 animate-pulse"
                  >
                    🖨️ 2. Descargar PDF / Imprimir
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA DEL DOCUMENTO */}
        <div className="w-full md:w-2/3 bg-gray-200 p-8 rounded-xl min-h-[500px] flex justify-center items-start overflow-auto">
          {datosInforme ? (
            // Aquí renderizamos el componente "Hoja de Papel"
            // Le pasamos la 'ref' para que la librería sepa que esto es lo que se imprime
            <div className="shadow-2xl">
               <InformeDocumento ref={componentRef} datos={datosInforme} />
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-4xl mb-4">📄</p>
              <p>Selecciona los filtros y haz clic en "Generar Vista Previa"</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InformesPage;