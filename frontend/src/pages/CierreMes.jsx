import React, { useState } from 'react';
import api from '../api/client';
import { Lock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const SeccionCierreMes = ({ comunidadId, mesActual, anioActual, onCierreExitoso }) => {
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const handleCierre = async () => {
    // ASEGURAMOS DATOS LIMPIOS
    const idNum = parseInt(comunidadId);
    const m = parseInt(mesActual);
    const a = parseInt(anioActual);

    if (!idNum || !m || !a || isNaN(idNum) || isNaN(m) || isNaN(a)) {
      alert("⚠️ Error: Selecciona un mes y año válidos en la parte superior.");
      return;
    }

    try {
      setLoading(true);
      // Petición al Backend con los datos manuales seleccionados
      const response = await api.post(`/api/cierre/${idNum}?mes=${m}&anio=${a}`);
      
      alert(`✅ ¡Cierre Exitoso! Se han generado los cobros para el periodo ${m}/${a}.`);
      if (onCierreExitoso) onCierreExitoso(response.data);
      setConfirmado(false);
    } catch (error) {
      console.error("Error en el cierre:", error);
      alert(error.response?.data?.detail || "Error al procesar el cierre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-rose-100 shadow-sm overflow-hidden mt-8">
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Lock size={28} /></div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Cierre de Periodo: {mesActual}/{anioActual}</h3>
            <p className="text-gray-500 text-sm max-w-md">Calcula los gastos de este periodo y genera cobros automáticos para todos los departamentos.</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {!confirmado ? (
            <button onClick={() => setConfirmado(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all">
              Iniciar Cierre de {mesActual}/{anioActual}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm bg-rose-50 px-3 py-1 rounded-lg">
                <AlertTriangle size={16} /> ¿Confirmas que los gastos están completos?
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmado(false)} className="px-4 py-2 text-gray-400 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onClick={handleCierre} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  Sí, Ejecutar Cierre
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeccionCierreMes;