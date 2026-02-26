import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function ReportesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🛑 DATOS DE PRUEBA: Luego los traeremos de FastAPI
  const historialData = [
    { mes: 'Sep', ingresos: 1200000, egresos: 900000 },
    { mes: 'Oct', ingresos: 1100000, egresos: 1050000 },
    { mes: 'Nov', ingresos: 1300000, egresos: 850000 },
    { mes: 'Dic', ingresos: 1250000, egresos: 1400000 }, // Diciembre suele tener más gastos
    { mes: 'Ene', ingresos: 1400000, egresos: 950000 },
    { mes: 'Feb', ingresos: 1500000, egresos: 1100000 },
  ];

  const desgloseEgresos = [
    { name: 'Sueldos y Leyes Sociales', value: 650000 },
    { name: 'Mantención Ascensores', value: 150000 },
    { name: 'Artículos de Aseo', value: 80000 },
    { name: 'Cuentas Básicas (Luz/Agua)', value: 220000 },
  ];

  // Colores para el gráfico de torta
  const COLORES_TORTA = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="space-y-6 animate-fade-in-down">
      
      {/* Encabezado con botón de volver */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)} // Vuelve a la página anterior
          className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          &larr; Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Reportes Detallados</h1>
          <p className="text-gray-500 text-sm">Análisis financiero profundo de la comunidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Historial de 6 meses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Evolución (Últimos 6 meses)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `$${(value / 1000)}k`} 
                />
                <Tooltip formatter={(value) => formatMoney(value)} cursor={{fill: '#f9fafb'}} />
                <Legend iconType="circle" />
                <Bar dataKey="ingresos" name="Ingresos" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="egresos" name="Egresos" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: Desglose de Egresos (Torta) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2 w-full text-left">Desglose de Egresos (Mes Actual)</h3>
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={desgloseEgresos}
                  cx="50%"
                  cy="50%"
                  innerRadius={80} // Esto lo hace ver como una "dona" en lugar de torta completa
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {desgloseEgresos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_TORTA[index % COLORES_TORTA.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReportesPage;