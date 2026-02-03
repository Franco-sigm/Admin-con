import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' 
import api from '../api/client' // Tu cliente Axios

const InformesPage = () => {
  const { id } = useParams(); // 1. Capturamos el ID de la comunidad de la URL
  
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    tipo: 'balance_mensual'
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Preparamos los datos incluyendo el ID de la comunidad
      const payload = { 
        ...filtros, 
        comunidad_id: id // ¡Esto es vital para el backend!
      };

      const response = await api.post('/informes/generar', payload, {
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_${filtros.tipo}_${filtros.mes}-${filtros.anio}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("✅ Informe generado correctamente.");
    } catch (error) {
      console.error("Error generando informe:", error);
      alert("❌ Error al generar el informe. Revisa que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Generación de Informes</h1>
        <p className="text-gray-600 mt-2">Selecciona los parámetros para descargar los reportes oficiales del condominio.</p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Configuración del Reporte</h2>
        
        <form onSubmit={handleGenerarReporte} className="space-y-6">
          
          {/* Selección de Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
            <select 
              name="tipo" 
              value={filtros.tipo} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="balance_mensual">💰 Balance Financiero Mensual</option>
              <option value="lista_residentes">👥 Nómina de Residentes</option>
            </select>
          </div>

          {/* Filtros de Fecha (Solo si es Balance) */}
          {filtros.tipo === 'balance_mensual' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select 
                  name="mes" 
                  value={filtros.mes} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, i) => (
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Botón de Acción */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition duration-200 flex justify-center items-center gap-2
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
              }`}
          >
            {loading ? "Procesando PDF..." : "📥 Descargar Informe PDF"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InformesPage;