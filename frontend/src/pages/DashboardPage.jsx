import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; // Nuestro cliente axios configurado

function DashboardPage() {
  const { id } = useParams(); // ID de la comunidad
  const [loading, setLoading] = useState(true);
  
  // Estado para los KPIs
  const [stats, setStats] = useState({
    totalResidentes: 0,
    unidadesOcupadas: 0,
    balance: 0,
    ingresos: 0,
    egresos: 0
  });

  // Estado para la lista de actividad
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    if (id) cargarDatosDashboard();
  }, [id]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);

      const [resResidentes, resTransacciones] = await Promise.all([
        api.get(`/residentes`, { params: { comunidad_id: id } }),
        api.get(`/transacciones/${id}`)
      ]);

      const dataResidentes = resResidentes.data;
      const dataTransacciones = resTransacciones.data;

      // --- CÁLCULOS DE KPI ---
      const totalRes = dataResidentes.length;
      const unidadesUnicas = new Set(dataResidentes.map(r => r.unidad)).size;

      const ingresos = dataTransacciones
        .filter(t => t.tipo === 'INGRESO')
        .reduce((acc, curr) => acc + curr.monto, 0);
        
      const egresos = dataTransacciones
        .filter(t => t.tipo === 'EGRESO')
        .reduce((acc, curr) => acc + curr.monto, 0);

      const ultimasTx = dataTransacciones.slice(0, 4);

      setStats({
        totalResidentes: totalRes,
        unidadesOcupadas: unidadesUnicas,
        balance: ingresos - egresos,
        ingresos,
        egresos
      });

      setActividadReciente(ultimasTx);

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

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
             {/* Icono Calendario Pequeño */}
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Residentes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalResidentes}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            {/* Icono Users Group */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 2: Unidades Ocupadas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unidades</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.unidadesOcupadas}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            {/* Icono Building/Apartment */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5h2m-2 3h2m-2 3h2" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 3: Solicitudes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-70">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solicitudes</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Pronto</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            {/* Icono Clipboard/Pending */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 4: Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance Total</p>
            <p className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                {formatMoney(stats.balance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
             {/* Icono Banknotes */}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN CENTRAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Resumen Financiero */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <div className="w-full flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-gray-800">Resumen Financiero</h3>
             <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver reporte completo</button>
          </div>
          
          <div className="h-64 w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 gap-4">
             <div className="flex gap-12">
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ingresos</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatMoney(stats.ingresos)}</p>
                </div>
                <div className="w-px bg-gray-300 h-12"></div>
                <div className="text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Egresos</p>
                    <p className="text-2xl font-bold text-rose-600">{formatMoney(stats.egresos)}</p>
                </div>
             </div>
             <p className="text-xs mt-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Gráfico detallado próximamente
             </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Actividad Reciente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Últimos Movimientos</h3>
          
          <div className="space-y-4">
            {actividadReciente.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4 italic">No hay actividad registrada.</p>
            ) : (
                actividadReciente.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border 
                            ${tx.tipo === 'INGRESO' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            {/* Flechas profesionales en lugar de texto IN/OUT */}
                            {tx.tipo === 'INGRESO' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{tx.descripcion}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(tx.fecha).toLocaleDateString()} 
                            </p>
                        </div>
                        <div className={`text-sm font-bold ${tx.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {tx.tipo === 'INGRESO' ? '+' : '-'} {formatMoney(tx.monto)}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default DashboardPage;