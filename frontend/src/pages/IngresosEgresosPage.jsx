import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado'; 
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Filter } from 'lucide-react'; // 👈 Íconos premium

const IngresosEgresosPage = () => {
  const { id } = useParams(); 
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINACIÓN Y FILTROS ---
  const fechaActual = new Date();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1); 
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); 
  const limit = 15; 

  const [resumenFinanciero, setResumenFinanciero] = useState({
    ingresos: 0,
    egresos: 0,
    balance_actual: 0
  });

  // --- 1. CARGA DE DATOS ---
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

  // --- 2. CREAR Y EDITAR ---
  const handleSaveTransaction = async (dataFormulario) => {
    const token = localStorage.getItem('token'); 

    const payload = {
      tipo: dataFormulario.tipo,                    
      metodo_pago: dataFormulario.metodo_pago || 'TRANSFERENCIA', 
      monto_total: parseInt(dataFormulario.monto),   
      fecha: dataFormulario.fecha,                   
      descripcion: dataFormulario.descripcion || '',
      categoria: dataFormulario.categoria, 
      comunidad_id: parseInt(id),                    
      propiedad_id: dataFormulario.propiedad_id ? parseInt(dataFormulario.propiedad_id) : null,
      comprobante_url: null                          
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (payload.tipo === 'INGRESO') {
        await api.post('/api/finanzas/pagos', payload, config);
      } else {
        await api.post('/api/finanzas/transacciones', payload, config); 
      }

      alert("✅ Registrado con éxito en Admin-con");
      fetchTransactions();
      fetchBalance();
      setIsModalOpen(false);

    } catch (error) {
      if (error.response?.status === 422) {
        console.error("Error de validación:", error.response.data.detail);
        alert("⚠️ Error de validación: Los datos no coinciden con el formato del servidor.");
      } else {
        alert("Ocurrió un error al procesar la finanza.");
      }
    }
  };

  const handleDelete = async (transaccionId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.")) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await api.delete(`/api/finanzas/transacciones/${transaccionId}`, config);
      alert("✅ Movimiento eliminado exitosamente.");

      if (transactions.length === 1 && page > 1) {
          setPage(page - 1);
      } else {
          fetchTransactions();
          fetchBalance();
      }

    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el movimiento. Verifica tus permisos.");
    }
  };

  const openEditModal = (transaccion) => {
    setEditingTransaction({
        ...transaccion,
        monto: transaccion.monto_total
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => filterType === 'TODOS' ? true : t.tipo === filterType);
  const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Finanzas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de ingresos, egresos y flujo de caja.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-blue-900 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-900/20 transition-all duration-200 flex items-center gap-2 font-medium active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Registrar Movimiento
        </button>
      </div>

      {/* --- TARJETAS RESUMEN (ADN Visual Tactile) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* HERO KPI: Balance (Relieve Metálico Oscuro) */}
        <div className="bg-gradient-to-b from-green-500 to-green-900 text-white p-6 rounded-2xl border border-gray-700 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.6)] hover:from-green-500 hover:to-green-900">
          <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
            <Wallet size={80} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-white uppercase tracking-widest mb-1 drop-shadow-sm">Balance Actual</p>
            <p className="text-4xl font-bold tracking-tight drop-shadow-md">{formatCurrency(resumenFinanciero.balance_actual)}</p>
          </div>
        </div>

        {/* Tarjeta Ingresos (Neumorphic Ligero) */}
        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)] group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ingresos Mes</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(resumenFinanciero.ingresos)}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-100/50 shadow-sm shadow-emerald-100/50">
               <TrendingUp className="text-emerald-500 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tarjeta Egresos (Neumorphic Ligero) */}
        <div className="bg-gradient-to-b from-white to-gray-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)] group">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Egresos Mes</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(resumenFinanciero.egresos)}</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-lg border border-rose-100/50 shadow-sm shadow-rose-100/50">
                <TrendingDown className="text-rose-500 w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* --- SECCIÓN PRINCIPAL: FILTROS Y TABLA --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col">
        
        {/* Controles: Filtros y Selector de Mes */}
        <div className="p-5 border-b border-gray-200/80 bg-white/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Filtros tipo "Pill Segmented Control" */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 shadow-inner">
                {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
                    <button 
                      key={type} 
                      onClick={() => setFilterType(type)} 
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                        filterType === type 
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 border border-transparent'
                      }`}
                    >
                        {type === 'INGRESO' && <TrendingUp className="w-3 h-3" />}
                        {type === 'EGRESO' && <TrendingDown className="w-3 h-3" />}
                        {type === 'TODOS' && <Filter className="w-3 h-3" />}
                        {type}
                    </button>
                ))}
            </div>

            {/* Selector de Mes Premium */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <select 
                  value={mes} 
                  onChange={(e) => { setMes(e.target.value); setPage(1); }} 
                  className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                >
                    <option value="">Todos los meses</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                </select>
                {/* Flecha personalizada para el select */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-200/80">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Descripción</th>
                <th className="p-4 font-semibold">Método de Pago</th>
                <th className="p-4 font-semibold text-right">Monto</th>
                <th className="p-4 font-semibold text-center">Tipo</th>
                <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
            </thead>

            <tbody className="divide-y divide-gray-100/80 bg-white">
                {loading ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <p className="text-sm font-medium animate-pulse">Cargando movimientos...</p>
                    </div>
                  </td>
                </tr>
                ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2">
                        <Wallet className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">No hay movimientos</p>
                      <p className="text-xs">Aún no se han registrado transacciones en este periodo.</p>
                    </div>
                  </td>
                </tr>
                ) : (
                    filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="p-4 text-gray-600 text-sm font-medium whitespace-nowrap">
                            {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4 text-gray-900 font-semibold">{item.descripcion}</td>
                        <td className="p-4">
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] border border-gray-200 font-bold tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
                                {item.metodo_pago || 'N/A'}
                            </span>
                        </td>
                        <td className={`p-4 text-right font-bold whitespace-nowrap ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {item.tipo === 'EGRESO' ? '-' : '+'} {formatCurrency(item.monto_total)}
                        </td>
                        <td className="p-4 text-center">
                           <span className={`inline-block px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border shadow-[inset_0_1px_0_rgba(255,255,255,1)] ${item.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                               {item.tipo}
                           </span>
                        </td>
                        
                        <td className="p-4 text-center">
                            <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(item)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all" title="Editar">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>

        {/* --- Paginación Premium --- */}
        {totalItems > 0 && (
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-200/80">
                <BotonPaginado
                    page={page} 
                    setPage={setPage} 
                    totalPages={totalPages} 
                />
            </div>
        )}
      </div>

      {/* Modal */}
      <ModalNuevaTransaccion 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction} 
      />
    </div>
  );
};

export default IngresosEgresosPage;