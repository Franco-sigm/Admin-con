import React, { useState } from 'react';
import Papa from 'papaparse';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../api/client';

const ImportarResidentesModal = ({ isOpen, onClose, onImportSuccess, comunidadId }) => {
  const [archivo, setArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
    }
  };

  const descargarPlantilla = () => {
    const encabezados = "numero_unidad,nombre,email,telefono,prorrateo\n";
    const ejemplo = "101,Juan Perez,juan@ejemplo.com,+56912345678,0.025";
    const blob = new Blob([encabezados + ejemplo], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_residentes.csv';
    a.click();
  };

  const procesarCSV = () => {
    if (!archivo) return;
    setProcesando(true);

    Papa.parse(archivo, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const payload = results.data.map(fila => ({
            numero_unidad: String(fila.numero_unidad || '').trim(),
            nombre: String(fila.nombre || '').trim(),
            email: fila.email?.trim() || null,
            telefono: fila.telefono?.trim() || null,
            prorrateo: parseFloat(fila.prorrateo) || 0
          })).filter(f => f.numero_unidad && f.nombre); // Validación mínima: debe tener unidad y nombre

          const response = await api.post(`/api/residentes/comunidad/${comunidadId}/importar`, payload);
          
          setResultado(response.data);
          if (onImportSuccess) onImportSuccess();
        } catch (error) {
          console.error("Error importando:", error);
          alert("Error al procesar el archivo en el servidor.");
        } finally {
          setProcesando(false);
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Carga Masiva de Datos
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instrucciones y Plantilla */}
          {!resultado && (
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <FileText className="w-5 h-5 text-indigo-600 mt-1" />
              <div className="space-y-2">
                <p className="text-xs text-indigo-900 font-medium">
                  Usa nuestra plantilla CSV para asegurar que el formato de las columnas sea el correcto.
                </p>
                <button 
                  onClick={descargarPlantilla}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Descargar plantilla .csv
                </button>
              </div>
            </div>
          )}

          {/* Área de Carga / Resultado */}
          {!resultado ? (
            <div className="relative group">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all 
                ${archivo ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200 group-hover:border-indigo-400 bg-gray-50'}`}>
                <Upload className={`w-8 h-8 mx-auto mb-3 ${archivo ? 'text-emerald-500' : 'text-gray-300'}`} />
                <p className="text-sm font-bold text-gray-700">
                  {archivo ? archivo.name : "Selecciona tu archivo CSV"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Arrastra o haz clic aquí</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Proceso Finalizado</h4>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-600">{resultado.creados}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Exitosos</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-2xl font-bold text-rose-500">{resultado.errores}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Con errores</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
            >
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button 
                onClick={procesarCSV}
                disabled={!archivo || procesando}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {procesando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : 'Iniciar Carga'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarResidentesModal;