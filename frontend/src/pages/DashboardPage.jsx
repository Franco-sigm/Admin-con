import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function DashboardPage() {
  const { id } = useParams(); // ID de la comunidad
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estado para los KPIs
  const [stats, setStats] = useState({
    totalResidentes: 0,    // Lo conectaremos en la Fase 2
    unidadesOcupadas: 0,   // Lo conectaremos en la Fase 2
    balance: 0,
    ingresos: 0,
    egresos: 0
  });

  // Estado para la lista de morosos
  const [morosos, setMorosos] = useState([]);

  useEffect(() => {
    if (id) cargarDatosDashboard();
  }, [id]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);

      // Le pedimos a FastAPI que haga el trabajo pesado de sumar y cruzar datos
      const [resBalance, resMorosos] = await Promise.all([
        api.get(`/api/informes/comunidad/${id}/balance`),
        api.get(`/api/informes/comunidad/${id}/morosos`),
      ]);

      const dataBalance = resBalance.data;
      const dataMorosos = resMorosos.data;

      // Actualizamos los KPIs financieros
      setStats(prev => ({
        ...prev,
        balance: dataBalance.balance_actual || 0,
        ingresos: dataBalance.ingresos || 0,
        egresos: dataBalance.egresos || 0
      }));

      // Guardamos el Top 5 de departamentos con deudas
      setMorosos(dataMorosos.slice(0, 5));

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  // Preparamos los datos para el gráfico de Recharts (Mes Actual)
  const dataGrafico = [
    {
      name: 'Mes Actual',
      Ingresos: stats.ingresos,
      Egresos: stats.egresos,
    }
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-down">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 text-sm">Resumen general de la comunidad</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm capitalize flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
             </svg>
             {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* --- TARJETAS SUPERIORES (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Residentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-70">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Residentes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">-</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 2: Unidades Ocupadas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-70">
          <div>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidades</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">-</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5h2m-2 3h2m-2 3h2" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 3: Ingresos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ingresos Mes</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(stats.ingresos)}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 4: Balance Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance Total</p>
            <p className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                {formatMoney(stats.balance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN CENTRAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Resumen Financiero con Recharts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-full flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-800">Resumen Financiero</h3>
            <button 
              onClick={() => navigate(`/comunidad/${id}/reportes`)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Ver reporte completo &rarr;
            </button>
          </div>
          
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataGrafico}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6b7280', fontSize: 12}}
                  tickFormatter={(value) => `$${(value / 1000)}k`}
                />
                <Tooltip 
                  formatter={(value) => formatMoney(value)}
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="Ingresos" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Egresos" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMNA DERECHA: Alerta de Morosos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Atención: Morosos
            </h3>
            <p className="text-xs text-gray-500 mb-4">Departamentos con mayor deuda</p>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {morosos.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-emerald-600 text-sm text-center py-6 px-4 font-medium bg-emerald-50 rounded-lg border border-emerald-100 w-full">
                      🎉 ¡Al día! No hay deudas pendientes registradas en el sistema.
                    </p>
                  </div>
              ) : (
                  morosos.map((deudor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                  #{deudor.numero_unidad}
                              </div>
                              <div>
                                  <p className="text-sm font-semibold text-gray-800">Unidad {deudor.numero_unidad}</p>
                                  <p className="text-xs text-red-500 font-medium">Deuda pendiente</p>
                              </div>
                          </div>
                          <div className="text-sm font-bold text-red-600">
                              {formatMoney(deudor.deuda_total)}
                          </div>
                      </div>
                  ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardPage;