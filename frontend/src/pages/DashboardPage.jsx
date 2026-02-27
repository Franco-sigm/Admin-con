import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Building2, Users, AlertCircle, ArrowRight } from 'lucide-react';

function DashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalResidentes: 0,
    unidadesOcupadas: 0,
    balance: 0,
    ingresos: 0,
    egresos: 0
  });

  const [morosos, setMorosos] = useState([]);

  useEffect(() => {
    if (id) cargarDatosDashboard();
  }, [id]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      const [resBalance, resMorosos, resResidentes, resPropiedades] = await Promise.all([
        api.get(`/api/informes/comunidad/${id}/balance`),
        api.get(`/api/informes/comunidad/${id}/morosos`),
        api.get(`/api/residentes/comunidad/${id}?limit=1`), 
        api.get(`/api/propiedades/comunidad/${id}?limit=1`) 
      ]);

      setStats({
        balance: resBalance.data.balance || 0,
        ingresos: resBalance.data.ingresos || 0,
        egresos: resBalance.data.egresos || 0,
        totalResidentes: resResidentes.data.total !== undefined ? resResidentes.data.total : (resResidentes.data.length || 0),
        unidadesOcupadas: resPropiedades.data.total !== undefined ? resPropiedades.data.total : (resPropiedades.data.length || 0)
      });

      setMorosos(resMorosos.data.slice(0, 5));
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const dataGrafico = [
    { name: 'Ingresos', Monto: stats.ingresos, fill: '#10b981' },
    { name: 'Egresos', Monto: stats.egresos, fill: '#f43f5e' }
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen financiero y operativo de la comunidad.</p>
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] px-4 py-2 rounded-lg">
          {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* --- KPIs (Con efecto de relieve/tactile design) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* HERO KPI: Balance (Relieve Metálico Oscuro) */}
        <div className="bg-gradient-to-b from-green-500 to-green-900 text-white p-6 rounded-2xl border border-gray-700 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.6)] hover:from-green-500 hover:to-green-900">
          <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
            <Wallet size={80} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-white uppercase tracking-widest mb-1 drop-shadow-sm">Fondo Disponible</p>
            <p className="text-4xl font-bold tracking-tight drop-shadow-md">{formatMoney(stats.balance)}</p>
          </div>
          <div className="relative z-10 mt-6 flex items-center text-xs text-green-300 gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            Actualizado hoy
          </div>
        </div>

        {/* Tarjetas Secundarias (Relieve Suave "Glass/Neumorphic" ligero) */}
        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)] group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatMoney(stats.ingresos)}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-100/50 shadow-sm shadow-emerald-100/50">
               <TrendingUp className="text-emerald-500 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)] group">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Unidades</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.unidadesOcupadas}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-100/50 shadow-sm shadow-gray-100/50">
                <Building2 className="text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)] group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Residentes</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats.totalResidentes}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-100/50 shadow-sm shadow-gray-100/50">
               <Users className="text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* --- SECCIÓN CENTRAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico con relieve */}
        <div className="lg:col-span-2 bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider drop-shadow-sm">Flujo de Caja</h3>
             <button onClick={() => navigate(`/comunidad/${id}/reportes`)} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 group bg-white border border-gray-200 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,1)] px-3 py-1.5 rounded-lg hover:shadow-md">
               Ver detalle <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={60}>
                {/* Definimos gradientes para las barras para darles volumen */}
                <defs>
                  <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorEgreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value) => formatMoney(value)}
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                />
                <Bar dataKey="Monto">
                  {
                    dataGrafico.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.name === 'Ingresos' ? 'url(#colorIngreso)' : 'url(#colorEgreso)'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Morosos con Relieve */}
        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 drop-shadow-sm">
               <AlertCircle className="w-4 h-4 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
               Cuentas por Cobrar
             </h3>
           </div>
            
            <div className="space-y-2 flex-1 overflow-y-auto">
              {morosos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                      <Wallet className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Todo al día</p>
                    <p className="text-xs text-gray-500 mt-1">No hay deudas pendientes registradas.</p>
                  </div>
              ) : (
                  morosos.map((deudor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-all group cursor-default">
                          <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-800 group-hover:text-rose-600 transition-colors">Unidad {deudor.numero_unidad}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Atrasado</p>
                              </div>
                          </div>
                          <div className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60 shadow-inner">
                              {formatMoney(deudor.deuda_total)}
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