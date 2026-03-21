import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Download, FileText, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReportesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [historialData, setHistorialData] = useState([]);
  const [desgloseEgresos, setDesgloseEgresos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState('6meses'); // 'mensual' | '6meses' | 'anual'

  const COLORES_TORTA = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Enviamos el periodo como query param al backend
        const respuesta = await api.get(`/api/informes/comunidad/${id}/reportes?periodo=${periodo}`, config);
        
        setHistorialData(respuesta.data.historial || []);
        setDesgloseEgresos(respuesta.data.desglose || []);
      } catch (error) {
        console.error("Error cargando los reportes", error);
      } finally {
        setCargando(false);
      }
    };
    if (id) cargarDatos();
  }, [id, periodo]);

  // 🖨️ FUNCIÓN PARA EXPORTAR A PDF (Contextual)
  const generarPDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-ES');
    const titulos = {
        mensual: 'Reporte Mensual (Detalle Diario)',
        '6meses': 'Reporte Semestral (Últimos 6 Meses)',
        anual: 'Reporte Anual (Resumen del Año)'
    };

    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55); 
    doc.text(titulos[periodo], 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); 
    doc.text(`Generado el: ${fechaActual} | Comunidad ID: ${id}`, 14, 30);
    doc.line(14, 35, 196, 35);

    // --- SECCIÓN 1: Tabla de Egresos ---
    doc.setFontSize(14);
    doc.text('Desglose de Egresos por Categoría', 14, 45);

    const tablaEgresos = desgloseEgresos.map(item => [item.name, formatMoney(item.value)]);
    const totalEgresos = desgloseEgresos.reduce((acc, curr) => acc + curr.value, 0);
    tablaEgresos.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, formatMoney(totalEgresos)]);

    autoTable(doc, {
      startY: 50,
      head: [['Categoría', 'Monto']],
      body: tablaEgresos,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: { 1: { halign: 'right' } }
    });

    // --- SECCIÓN 2: Tabla de Evolución ---
    doc.setFontSize(14);
    doc.text('Evolución de Ingresos y Egresos', 14, doc.lastAutoTable.finalY + 15);

    const tablaHistorial = historialData.map(item => [
      item.mes || item.fecha || item.label,
      formatMoney(item.ingresos),
      formatMoney(item.egresos),
      formatMoney(item.ingresos - item.egresos)
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Periodo', 'Ingresos', 'Egresos', 'Balance']],
      body: tablaHistorial,
      theme: 'striped',
      headStyles: { fillColor: [31, 41, 55] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    doc.save(`Reporte_${periodo}_${id}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <PieChartIcon className="text-indigo-600 w-6 h-6" />
              Inteligencia Financiera
            </h1>
            <p className="text-gray-500 text-sm">Visualiza y exporta el rendimiento de tu comunidad.</p>
          </div>
        </div>

        {/* SELECTOR DE TEMPORALIDAD (TABS) */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
            {[
                { id: 'mensual', label: 'Mensual', icon: Calendar },
                { id: '6meses', label: 'Semestral', icon: FileText },
                { id: 'anual', label: 'Anual', icon: PieChartIcon }
            ].map((t) => (
                <button
                    key={t.id}
                    onClick={() => setPeriodo(t.id)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        periodo === t.id 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                </button>
            ))}
        </div>

        <button 
          onClick={generarPDF}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 font-bold active:scale-95"
        >
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      {cargando ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold animate-pulse">Procesando datos del servidor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* GRÁFICO DE BARRAS: Evolución */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText className="text-indigo-500 w-5 h-5" />
                    {periodo === 'mensual' ? 'Flujo Diario del Mes' : periodo === 'anual' ? 'Resumen Mensual del Año' : 'Evolución últimos 6 meses'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Comparativa de ingresos y egresos totales.</p>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historialData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="gradEgreso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey={periodo === 'mensual' ? 'fecha' : 'mes'} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                        dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(value) => `$${(value / 1000)}k`} 
                      tick={{fill: '#94a3b8', fontSize: 11}}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(v) => formatMoney(v)}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                    <Bar dataKey="ingresos" name="Ingresos" fill="url(#gradIngreso)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="egresos" name="Egresos" fill="url(#gradEgreso)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICO DE DONA: Categorías */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <PieChartIcon className="text-rose-500 w-5 h-5" />
                    Composición de Gastos
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Distribución porcentual por categorías de egreso.</p>
              </div>

              {desgloseEgresos.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <PieChartIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm font-bold">Sin gastos en este periodo</p>
                 </div>
              ) : (
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={desgloseEgresos}
                        cx="50%" cy="50%"
                        innerRadius={80} outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {desgloseEgresos.map((_, index) => (
                          <Cell key={index} fill={COLORES_TORTA[index % COLORES_TORTA.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v) => formatMoney(v)}
                        contentStyle={{ borderRadius: '16px', border: 'none' }}
                      />
                      <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

        </div>
      )}
    </div>
  );
}

export default ReportesPage;