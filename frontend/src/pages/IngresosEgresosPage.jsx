import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';
import api from '../api/client'; 
import BotonPaginado from '../components/BotonPaginado'; 
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Filter, FileText, ExternalLink } from 'lucide-react';

const IngresosEgresosPage = () => {
  const { id } = useParams(); 
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // --- 2. GUARDAR (CON SOPORTE PARA ARCHIVOS) ---
  const handleSaveTransaction = async (dataFormulario, archivoSeleccionado) => {
    const token = localStorage.getItem('token'); 

    // 1. Creamos el FormData
    const formData = new FormData();
    formData.append('tipo', dataFormulario.tipo);
    formData.append('monto_total', parseFloat(dataFormulario.monto)); // Usar float para evitar errores
    formData.append('metodo_pago', dataFormulario.metodo_pago || 'TRANSFERENCIA');
    formData.append('descripcion', dataFormulario.descripcion || '');
    formData.append('categoria', dataFormulario.categoria || 'Otros');
    formData.append('comunidad_id', parseInt(id));
    
    // --- EL CAMPO FALTANTE ---
    // Si dataFormulario.fecha no existe, enviamos la fecha actual en formato YYYY-MM-DD
    const fechaEnvio = dataFormulario.fecha || new Date().toISOString().split('T')[0];
    formData.append('fecha', fechaEnvio); 
    // -------------------------

    if (dataFormulario.propiedad_id) {
        formData.append('propiedad_id', parseInt(dataFormulario.propiedad_id));
    }
    
    if (archivoSeleccionado) {
        formData.append('archivo', archivoSeleccionado);
    }

    try {
      const config = {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      };

      // Decisión de endpoint
      if (dataFormulario.tipo === 'INGRESO' && !archivoSeleccionado) {
        // Si es ingreso sin foto, puedes usar /pagos (si este acepta JSON)
        // Pero lo más seguro para evitar el 422 es usar /transacciones que ya acepta el FormData
        await api.post('/api/finanzas/transacciones', formData, config);
      } else {
        await api.post('/api/finanzas/transacciones', formData, config); 
      }

      alert("✅ Registrado con éxito");
      fetchTransactions();
      fetchBalance();
      setIsModalOpen(false);

    } catch (error) {
        console.error("Error detallado:", error.response?.data); // Esto te dirá exactamente qué campo falla
        alert("Error: " + (error.response?.data?.detail?.[0]?.msg || "Ocurrió un error al procesar la finanza."));
    }
  };

  const handleDelete = async (transaccionId) => {
    if (!window.confirm("¿Estás seguro?")) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/api/finanzas/transacciones/${transaccionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
      fetchBalance();
    } catch (error) {
      alert("No se pudo eliminar.");
    }
  };

  const openEditModal = (transaccion) => {
    setEditingTransaction({ ...transaccion, monto: transaccion.monto_total });
    setIsModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => filterType === 'TODOS' ? true : t.tipo === filterType);
  const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Finanzas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de ingresos, egresos y comprobantes.</p>
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
        <div className="bg-gradient-to-b from-green-600 to-green-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 opacity-80">Balance Actual</p>
            <p className="text-4xl font-bold tracking-tight">{formatCurrency(resumenFinanciero.balance_actual)}</p>
          </div>
          <Wallet className="absolute right-[-10px] bottom-[-10px] opacity-10" size={100} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Ingresos Mes</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(resumenFinanciero.ingresos)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500"><TrendingUp /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Egresos Mes</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(resumenFinanciero.egresos)}</p>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-500"><TrendingDown /></div>
        </div>
      </div>

      {/* Filtros y Tabla */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="flex bg-gray-200/50 p-1 rounded-xl">
                {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
                    <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                        {type}
                    </button>
                ))}
            </div>
            <select value={mes} onChange={(e) => setMes(e.target.value)} className="border border-gray-200 rounded-lg p-2 text-sm font-semibold">
                <option value="1">Enero</option><option value="2">Febrero</option><option value="3">Marzo</option>
                <option value="4">Abril</option><option value="5">Mayo</option><option value="6">Junio</option>
                <option value="7">Julio</option><option value="8">Agosto</option><option value="9">Septiembre</option>
                <option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option>
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest border-b">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Descripción</th>
                <th className="p-4 text-right">Monto</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4 text-center">Comprobante</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center animate-pulse">Cargando...</td></tr>
              ) : filteredTransactions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-sm text-gray-500">{new Date(item.fecha).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-gray-900">{item.descripcion}</td>
                  <td className={`p-4 text-right font-bold ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(item.monto_total)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.tipo === 'INGRESO' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {item.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {item.comprobante_url ? (
                      <a href={item.comprobante_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                        <FileText size={14} /> Ver <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-rose-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="p-4 bg-gray-50 border-t">
            <BotonPaginado page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        )}
      </div>

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