import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client'; // Nuestro cliente axios configurado

function DashboardPage() {
  const { id } = useParams(); // ID de la comunidad
  const [loading, setLoading] = useState(true);
  
  // Estado para los KPIs (Indicadores Clave)
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

      // 1. Hacemos las dos peticiones en paralelo para que cargue más rápido
      // Usamos Promise.all: Espera a que ambas terminen
      const [resResidentes, resTransacciones] = await Promise.all([
        api.get(`/residentes`, { params: { comunidad_id: id } }),
        api.get(`/transacciones/${id}`)
      ]);

      const dataResidentes = resResidentes.data;
      const dataTransacciones = resTransacciones.data;

      // --- CÁLCULOS DE KPI ---

      // 1. Total Residentes
      const totalRes = dataResidentes.length;

      // 2. Unidades Ocupadas (Contamos unidades únicas que tienen residente)
      // Usamos un Set para eliminar duplicados (si hay 2 personas en la 101, cuenta como 1 unidad)
      const unidadesUnicas = new Set(dataResidentes.map(r => r.unidad)).size;

      // 3. Finanzas
      const ingresos = dataTransacciones
        .filter(t => t.tipo === 'INGRESO')
        .reduce((acc, curr) => acc + curr.monto, 0);
        
      const egresos = dataTransacciones
        .filter(t => t.tipo === 'EGRESO')
        .reduce((acc, curr) => acc + curr.monto, 0);

      // 4. Actividad Reciente (Tomamos las últimas 4)
      // Como el backend ya las devuelve ordenadas por fecha, solo cortamos el array
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

  // Helper para formatear dinero
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
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-500">Resumen de actividad en tiempo real</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm capitalize">
             {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* --- TARJETAS SUPERIORES (KPIs REALE) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Residentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Residentes Totales</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalResidentes}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
            🧑‍🤝‍🧑
          </div>
        </div>

        {/* Tarjeta 2: Unidades Ocupadas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Unidades Ocupadas</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.unidadesOcupadas}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl">
            🏠
          </div>
        </div>

        {/* Tarjeta 3: Solicitudes (Aún estático porque no tenemos ese backend) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between opacity-60">
          <div>
            <p className="text-sm font-medium text-gray-500">Solicitudes Pendientes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
            <span className="text-xs text-orange-500 font-bold">Próximamente</span>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl">
            🕒
          </div>
        </div>

        {/* Tarjeta 4: Balance (Dinero Real) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Balance del Mes</p>
            <p className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                {formatMoney(stats.balance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl">
            
          </div>
        </div>
      </div>

      {/* --- SECCIÓN CENTRAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Gráfico Simplificado (Placeholder mejorado) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold text-gray-800 mb-4 w-full text-left">Resumen Financiero</h3>
          
          {/* Aquí podrías poner 'Recharts' en el futuro. Por ahora mostramos resumen texto */}
          <div className="h-64 w-full bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 gap-4">
             <div className="flex gap-8">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Total Ingresos</p>
                    <p className="text-xl font-bold text-emerald-600">{formatMoney(stats.ingresos)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-500">Total Egresos</p>
                    <p className="text-xl font-bold text-rose-600">{formatMoney(stats.egresos)}</p>
                </div>
             </div>
             <p className="text-xs mt-4">(Gráfico detallado próximamente)</p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Actividad Reciente REAL */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Movimientos Recientes</h3>
          
          <div className="space-y-4">
            {actividadReciente.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No hay actividad reciente.</p>
            ) : (
                actividadReciente.map((tx) => (
                    <div key={tx.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-1 
                        ${tx.tipo === 'INGRESO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.tipo === 'INGRESO' ? 'IN' : 'OUT'}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{tx.descripcion}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(tx.fecha).toLocaleDateString()} • {formatMoney(tx.monto)}
                        </p>
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