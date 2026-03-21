import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';
import SeccionCierreMes from '../components/SeccionCierreMes'; 
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado'; 
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet, FileText, ExternalLink, X, Calendar } from 'lucide-react';

const IngresosEgresosPage = () => {
  const { id } = useParams(); 
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState(null);

  // --- SELECCIÓN MANUAL DE PERIODO ---
  const fechaActual = new Date();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1); 
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  
  // Generamos lista de años dinámicamente
  const añosSoportados = [2024, 2025, 2026];

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const limit = 15; 

  const [resumenFinanciero, setResumenFinanciero] = useState({
    ingresos: 0,
    egresos: 0,
    balance_actual: 0
  });

  useEffect(() => {
    if(id) {
        fetchTransactions();
        fetchBalance();
    }
  }, [id, page, mes, anio]); 

  const fetchBalance = async () => {
      try {
          const response = await api.get(`/api/finanzas/comunidad/${id}/balance`);
          setResumenFinanciero(response.data);
      } catch (error) {
          console.error("Error cargando balance:", error);
      }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
          `/api/finanzas/comunidad/${id}/transacciones?mes=${mes}&anio=${anio}&page=${page}&limit=${limit}`
      );
      setTransactions(response.data.items || []);
      const total = response.data.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async (dataFormulario, archivoSeleccionado) => {
    const token = localStorage.getItem('token'); 
    const formData = new FormData();
    formData.append('tipo', dataFormulario.tipo);
    formData.append('monto_total', parseFloat(dataFormulario.monto));
    formData.append('metodo_pago', dataFormulario.metodo_pago || 'TRANSFERENCIA');
    formData.append('descripcion', dataFormulario.descripcion || '');
    formData.append('categoria', dataFormulario.categoria || 'Otros');
    formData.append('comunidad_id', parseInt(id));
    formData.append('fecha', dataFormulario.fecha || new Date().toISOString().split('T')[0]); 

    if (dataFormulario.propiedad_id) formData.append('propiedad_id', parseInt(dataFormulario.propiedad_id));
    if (archivoSeleccionado) formData.append('archivo', archivoSeleccionado);

    try {
      await api.post('/api/finanzas/transacciones', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      alert("✅ Registrado con éxito");
      fetchTransactions();
      fetchBalance();
      setIsModalOpen(false);
    } catch (error) {
        alert("Error al procesar la finanza.");
    }
  };

  const filteredTransactions = transactions.filter(t => filterType === 'TODOS' ? true : t.tipo === filterType);
  const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Finanzas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión manual de periodos y cierre para Parque Suizo.</p>
        </div>
        <button 
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Registrar Movimiento
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-b from-blue-800 to-blue-950 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 opacity-80">Balance Actual</p>
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(resumenFinanciero.balance_actual)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ingresos</p><p className="text-3xl font-bold text-emerald-600">{formatCurrency(resumenFinanciero.ingresos)}</p></div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500"><TrendingUp /></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div><p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Egresos</p><p className="text-3xl font-bold text-rose-600">{formatCurrency(resumenFinanciero.egresos)}</p></div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-500"><TrendingDown /></div>
        </div>
      </div>

      {/* FILTROS Y SELECCIÓN MANUAL DE PERIODO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center gap-6 bg-gray-50/50">
            
            {/* SELECTORES DE MES Y AÑO */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                <Calendar className="text-blue-900 ml-2" size={18} />
                <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer">
                    <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
                    <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
                    <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
                    <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
                </select>
                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer">
                    {añosSoportados.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>

            <div className="flex bg-gray-200/50 p-1 rounded-xl">
                {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
                    <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest border-b">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Descripción</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">Cargando...</td></tr>
              ) : filteredTransactions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-500">{new Date(item.fecha).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-gray-900">{item.descripcion}</td>
                  <td className={`p-4 text-right font-bold ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(item.monto_total)}</td>
                  <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[10px] font-bold ${item.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item.tipo}</span></td>
                  <td className="p-4 text-center">
                    <button onClick={() => setViewingFile(item.comprobante_url)} className="text-blue-600 hover:underline text-xs mr-2">Ver</button>
                    <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN DE CIERRE CON DATOS MANUALES */}
      {id && (
        <SeccionCierreMes 
          comunidadId={id} 
          mesActual={mes} 
          anioActual={anio} 
          onCierreExitoso={() => {
            fetchTransactions();
            fetchBalance();
          }}
        />
      )}

      {/* Modales y Visores (Igual que antes) */}
      <ModalNuevaTransaccion isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} transactionToEdit={editingTransaction} />
    </div>
  );
};

export default IngresosEgresosPage;