import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { generarMorosidadPDF } from '../utils/generarMorosidad';
import { generarBalancePDF } from '../utils/generarBalance'; // <-- El que crearemos a continuación

const InformesPage = () => {
  const { id } = useParams(); // ID de la comunidad

  // --- ESTADOS ---
  const [tipoInforme, setTipoInforme] = useState('');
  const [cargando, setCargando] = useState(false);
  const [datosPreview, setDatosPreview] = useState(null);

  // --- 1. TRAER LOS DATOS Y MOSTRAR VISTA PREVIA ---
  const handleCargarVistaPrevia = async () => {
    if (!tipoInforme) return alert("Por favor, selecciona el tipo de informe.");

    setCargando(true);
    setDatosPreview(null); 

    try {
      if (tipoInforme === 'morosidad') {
        const response = await client.get(`/informes/morosidad?comunidad_id=${id}`);
        setDatosPreview(response.data); // Es un Array []
      } 
      else if (tipoInforme === 'balance') {
        const response = await client.get(`/informes/balance?comunidad_id=${id}`);
        setDatosPreview(response.data); // Es un Objeto {}
      }
    } catch (error) {
      console.error("Error al cargar la vista previa:", error);
      alert("Hubo un problema al obtener los datos del servidor.");
    } finally {
      setCargando(false);
    }
  };

  // --- 2. GENERAR EL PDF CON LOS DATOS CARGADOS ---
  const handleDescargarPDF = () => {
    if (!datosPreview) return;
    
    const nombreComunidad = `Comunidad_${id}`; // Idealmente, si tienes el nombre real en un estado, úsalo aquí

    if (tipoInforme === 'morosidad') {
      generarMorosidadPDF(nombreComunidad, datosPreview);
    } else if (tipoInforme === 'balance') {
      generarBalancePDF(nombreComunidad, datosPreview);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Módulo de Informes</h1>
      
      {/* PANEL DE CONFIGURACIÓN */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 max-w-2xl">
        <p className="text-gray-600 mb-6">
          Selecciona el tipo de informe para visualizar los datos antes de exportarlos a PDF.
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Tipo de Informe</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tipoInforme}
            onChange={(e) => {
              setTipoInforme(e.target.value);
              setDatosPreview(null); // Ocultar vista previa si cambia de opción
            }}
          >
            <option value="">-- Elige el tipo de informe --</option>
            <option value="morosidad">Listado de Residentes Morosos</option>
            <option value="balance">Balance Financiero General</option>
          </select>
        </div>

        <button 
          onClick={handleCargarVistaPrevia}
          disabled={cargando || !tipoInforme}
          className={`w-full text-white font-bold py-3 px-4 rounded transition duration-200 
            ${(cargando || !tipoInforme) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {cargando ? 'Cargando datos...' : 'Generar Vista Previa'}
        </button>
      </div>

      {/* SECCIÓN DE VISTA PREVIA */}
      {datosPreview !== null && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Vista Previa del Documento</h2>
            <button 
              onClick={handleDescargarPDF}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Descargar PDF
            </button>
          </div>

          {/* RENDER CONDICIONAL: TABLA DE MOROSIDAD */}
          {tipoInforme === 'morosidad' && (
            datosPreview.length === 0 ? (
               <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-semibold">
                 🎉 ¡Excelente noticia! No hay residentes morosos en esta comunidad.
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-gray-700 font-semibold">Unidad</th>
                      <th className="p-3 text-gray-700 font-semibold">Residente</th>
                      <th className="p-3 text-gray-700 font-semibold">Teléfono</th>
                      <th className="p-3 text-gray-700 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPreview.map((fila, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-800">{fila.unidad}</td>
                        <td className="p-3 text-gray-800">{fila.nombre_residente}</td>
                        <td className="p-3 text-gray-800">{fila.telefono}</td>
                        <td className="p-3 text-red-600 font-bold">{fila.estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* RENDER CONDICIONAL: DASHBOARD DE BALANCE */}
          {tipoInforme === 'balance' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                <h3 className="text-green-800 font-semibold text-lg mb-2">Total Ingresos</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${datosPreview.total_ingresos.toLocaleString('es-CL')}
                </p>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                <h3 className="text-red-800 font-semibold text-lg mb-2">Total Egresos</h3>
                <p className="text-3xl font-bold text-red-600">
                  ${datosPreview.total_egresos.toLocaleString('es-CL')}
                </p>
              </div>

              <div className={`p-6 rounded-lg border text-center ${datosPreview.saldo_actual >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                <h3 className={`font-semibold text-lg mb-2 ${datosPreview.saldo_actual >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                  Saldo de la Comunidad
                </h3>
                <p className={`text-3xl font-bold ${datosPreview.saldo_actual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ${datosPreview.saldo_actual.toLocaleString('es-CL')}
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default InformesPage;