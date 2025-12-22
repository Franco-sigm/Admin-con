import React from 'react'

function DashboardPage() {
  return (
    <div className="space-y-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
          <p className="text-gray-500">Resumen de actividad de la comunidad</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
            📅 {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* --- TARJETAS SUPERIORES (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Residentes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Residentes Totales</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{"(en desarrollo)"}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
            👥
          </div>
        </div>

        {/* Tarjeta 2: Unidades Ocupadas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ocupación</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{"(en desarrollo)"}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl">
            🏢
          </div>
        </div>

        {/* Tarjeta 3: Solicitudes/Reclamos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Solicitudes Pendientes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{"(en desarrollo)"}</p>
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl">
            🔔
          </div>
        </div>

        {/* Tarjeta 4: Balance (Dinero) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Balance del Mes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{"(en desarrollo)"}</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl">
            💰
          </div>
        </div>
      </div>

      {/* --- SECCIÓN CENTRAL --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA (Grande): Gráfico simulado */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresos vs Egresos (Últimos 6 meses)</h3>
          
          {/* Placeholder visual de gráfico */}
          <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
            <span className="text-sm">Aquí se mostrará el gráfico financiero</span>
          </div>
        </div>

        {/* COLUMNA DERECHA (Pequeña): Actividad Reciente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
          
          <div className="space-y-4">
            {/* Item 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 mt-1">
                $$
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Pago Gasto Común</p>
                <p className="text-xs text-gray-500">{"(en desarrollo)"}</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 mt-1">
                NR
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Nuevo Residente</p>
                <p className="text-xs text-gray-500">{"(en desarrollo)"}</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700 mt-1">
                ⚠️
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Reporte de Ruido</p>
                <p className="text-xs text-gray-500">Torre B - Hace 1 día {"(en desarrollo)"}</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition">
            Ver todo el historial
          </button>
        </div>

      </div>

    </div>
  )
}

export default DashboardPage