// src/components/informes/InformeDocumento.jsx
import React from 'react';

// Importante: forwardRef permite que el componente "padre" (Page) tenga acceso a este elemento
const InformeDocumento = React.forwardRef((props, ref) => {
  const { datos } = props;

  if (!datos) return null;

  return (
    <div ref={ref} className="w-full max-w-[210mm] min-h-[297mm] p-10 bg-white mx-auto text-black shadow-lg print:shadow-none">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">ConAdmin</h1>
          <p className="text-sm text-gray-500">Gestión Inteligente de Condominios</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">{datos.tipo_informe}</h2>
          <p className="text-sm">Periodo: {datos.periodo}</p>
        </div>
      </div>

      {/* Resumen Ejecutivo (Cajas) */}
      {datos.resumen && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-100 rounded border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Ingresos</p>
            <p className="text-lg font-bold text-green-600">${datos.resumen.total_ingresos}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Egresos</p>
            <p className="text-lg font-bold text-red-600">${datos.resumen.total_egresos}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded border border-gray-200 text-center">
            <p className="text-xs text-gray-500 uppercase">Balance</p>
            <p className="text-lg font-bold text-blue-600">${datos.resumen.balance_final}</p>
          </div>
        </div>
      )}

      {/* Tabla de Detalles */}
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-200 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2 text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          {datos.detalles?.map((fila, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2">{fila.fecha}</td>
              <td className="px-4 py-2 font-medium">{fila.descripcion}</td>
              <td className="px-4 py-2">{fila.tipo}</td>
              <td className={`px-4 py-2 text-right font-bold ${fila.tipo === 'Egreso' ? 'text-red-500' : 'text-green-600'}`}>
                ${fila.monto}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pie de página */}
      <div className="mt-12 text-center text-xs text-gray-400">
        Generado automáticamente el {new Date().toLocaleDateString()}
      </div>
    </div>
  );
});

export default InformeDocumento;