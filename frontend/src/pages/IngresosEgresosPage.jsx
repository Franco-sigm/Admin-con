import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';
import api from '../api/client'; 

const IngresosEgresosPage = () => {
  const { id } = useParams(); 
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE PAGINACIÓN Y FILTROS ---
  const fechaActual = new Date();
  const [mes, setMes] = useState(fechaActual.getMonth() + 1); // getMonth() es 0-11, sumamos 1
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Cuántos queremos ver por pantalla

  // NUEVO: Estado para guardar el balance real que viene del backend
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
  }, [id]);

const fetchBalance = async () => {
      try {
          // 🚀 CORRECCIÓN: Apuntamos al endpoint de balance (tarjetas)
          const response = await api.get(`/api/finanzas/comunidad/${id}/balance`);
          setResumenFinanciero(response.data);
      } catch (error) {
          console.error("Error cargando balance:", error);
      }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // 🚀 Mandamos los parámetros en la URL (Query Params)
      const response = await api.get(
          `/api/finanzas/comunidad/${id}/transacciones?mes=${mes}&anio=${anio}&page=${page}&limit=${limit}`
      );
      
      
      // El backend ahora devuelve { total: X, items: [...] }
      setTransactions(response.data.items || []);
      
      // Calculamos cuántas páginas hay en total (Ej: 45 items / 20 = 3 páginas)
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
      
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 IMPORTANTE: Que el useEffect escuche los cambios de página, mes y año para volver a buscar
  useEffect(() => {
    if(id) {
        fetchTransactions();
    }
  }, [id, page, mes, anio]);
  // --- 2. CREAR Y EDITAR ---
const handleSaveTransaction = async (dataFormulario) => {
  const token = localStorage.getItem('token'); 

  // TRADUCTOR: Mapeamos los nombres del formulario a los nombres del Schema de FastAPI
  const payload = {
    tipo: dataFormulario.tipo,                     // 'INGRESO' o 'EGRESO'
    metodo_pago: dataFormulario.metodo_pago || 'TRANSFERENCIA', // Campo obligatorio en tu Enum
    monto_total: parseInt(dataFormulario.monto),   // FastAPI espera 'monto_total', NO 'monto'
    fecha: dataFormulario.fecha,                   // Formato YYYY-MM-DD
    descripcion: dataFormulario.descripcion || '', 
    comunidad_id: parseInt(id),                    // ID de la comunidad desde la URL
    propiedad_id: dataFormulario.propiedad_id ? parseInt(dataFormulario.propiedad_id) : null,
    comprobante_url: null                          // Campo opcional pero útil incluirlo como null
  };

  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    if (payload.tipo === 'INGRESO') {
      await api.post('/api/finanzas/pagos', payload, config);
    } else {
      // Esta es la ruta que lanzaba el 422
      await api.post('/api/finanzas/transacciones', payload, config); 
       
    }

    alert("✅ Registrado con éxito en Admin-con");
    fetchTransactions();
    fetchBalance();
    setIsModalOpen(false);

  } catch (error) {
    if (error.response?.status === 422) {
      // TIP: En la consola verás exactamente qué campo falta (dentro de error.response.data.detail)
      console.error("Error de validación:", error.response.data.detail);
      alert("⚠️ Error de validación: Los datos no coinciden con el formato del servidor.");
    } else {
      alert("Ocurrió un error al procesar la finanza.");
    }
  }
};

const handleDelete = async (transaccionId) => {
  // 1. Confirmación de seguridad para evitar borrados accidentales
  if (!window.confirm("¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.")) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Llamada al backend (Asegúrate de tener este endpoint DELETE en FastAPI)
    await api.delete(`/api/finanzas/transacciones/${transaccionId}`, config);

    alert("✅ Movimiento eliminado exitosamente.");

    // 3. RECARGA CRÍTICA: Actualizamos la lista y las tarjetas de balance
    fetchTransactions();
    fetchBalance();

  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar el movimiento. Verifica tus permisos.");
  }
};
  // --- FUNCIONES DE MODAL ---
  const openEditModal = (transaccion) => {
    // Al editar, le devolvemos 'monto' al modal por si este lo espera así
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
    <div className="p-6 bg-gray-50 min-h-screen animate-fade-in-down">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finanzas</h1>
          <p className="text-gray-500 text-sm">Resumen de ingresos y gastos</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[oklch(50%_0.134_242.749)] hover:bg-black text-white px-4 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2 "
        >
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {/* Tarjetas Resumen (CONECTADAS A FASTAPI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Ingresos Totales</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(resumenFinanciero.ingresos)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Egresos Totales</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(resumenFinanciero.egresos)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Balance Actual</p>
          <p className={`text-3xl font-bold mt-2 ${resumenFinanciero.balance_actual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(resumenFinanciero.balance_actual)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
          {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition ${filterType === type ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                  {type}
              </button>
          ))}
      </div>



      {/* Tabla de Transacciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <select value={mes} onChange={(e) => { setMes(e.target.value); setPage(1); }} className="p-2 border rounded">
            <option value="">Todos los meses</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            {/* ... Agrega los demás meses ... */}
            <option value="12">Diciembre</option>
        </select>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold">Método</th>
              <th className="p-4 font-semibold text-right">Monto</th>
              <th className="p-4 font-semibold text-center">Tipo</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="6" className="p-12 text-center text-gray-400">Cargando movimientos...</td></tr>
            ) : filteredTransactions.length === 0 ? (
               <tr><td colSpan="6" className="p-12 text-center text-gray-400">No hay movimientos registrados.</td></tr>
            ) : (
                filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 text-sm whitespace-nowrap">
                        {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-gray-800 font-medium">{item.descripcion}</td>
                    <td className="p-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200 font-medium">
                            {item.metodo_pago || 'N/A'}
                        </span>
                    </td>
                    {/* AHORA LEEMOS 'monto_total' */}
                    <td className={`p-4 text-right font-bold whitespace-nowrap ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.tipo === 'EGRESO' ? '-' : '+'} {formatCurrency(item.monto_total)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${item.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                        {item.tipo}
                      </span>
                    </td>
                    
                    {/* Botones de Acción */}
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition" title="Editar">
                                ✏️
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Eliminar">
                                🗑️
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          &larr; Anterior
        </button>
        <span className="text-sm text-gray-600">Página {page} de {totalPages || 1}</span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Siguiente &rarr;
        </button>
      </div>
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