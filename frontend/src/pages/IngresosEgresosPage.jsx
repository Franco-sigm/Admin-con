import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';

// IMPORTACIÓN CLAVE: Usamos el cliente configurado
import api from '../api/client'; 

const IngresosEgresosPage = () => {
  const { id } = useParams(); // ID de la comunidad
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. CARGA DE DATOS ---
  useEffect(() => {
    if(id) fetchTransactions();
  }, [id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Backend: GET /transacciones/<comunidad_id>
      // Nota: El backend ya devuelve la lista ordenada por fecha descendente.
      const response = await api.get(`/transacciones/${id}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      if (error.response?.status === 403) {
          alert("No tienes permiso para ver las finanzas de esta comunidad.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 2. CREAR Y EDITAR ---
  const handleSaveTransaction = async (dataFormulario) => {
    // Payload base (siempre enviamos comunidad_id)
    const payload = {
      ...dataFormulario,
      comunidad_id: parseInt(id)
    };

    try {
      if (dataFormulario.id) {
        // --- MODO EDICIÓN (PUT) ---
        await api.put(`/transacciones/${dataFormulario.id}`, payload);
        alert("✅ Transacción actualizada");
      } else {
        // --- MODO CREACIÓN (POST) ---
        await api.post('/transacciones', payload);
        alert("✅ Transacción registrada");
      }

      // Éxito: recargamos y cerramos
      fetchTransactions();
      setIsModalOpen(false);
      setEditingTransaction(null);

    } catch (error) {
      console.error("Error guardando:", error);
      const msg = error.response?.data?.detail || "No se pudo guardar";
      alert(`Error: ${msg}`);
    }
  };

  // --- 3. ELIMINAR ---
  const handleDelete = async (transaccionId) => {
    if(!window.confirm("¿Estás seguro de que quieres eliminar este registro? El monto se descontará del balance.")) return;

    try {
        await api.delete(`/transacciones/${transaccionId}`);
        alert("🗑️ Registro eliminado");
        fetchTransactions();
    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar el registro.");
    }
  };

  // --- FUNCIONES DE MODAL ---
  const openEditModal = (transaccion) => {
    setEditingTransaction(transaccion);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // --- CÁLCULOS (Tu lógica está perfecta) ---
  const totalIncome = transactions.filter(t => t.tipo === 'INGRESO').reduce((acc, curr) => acc + (curr.monto || 0), 0);
  const totalExpense = transactions.filter(t => t.tipo === 'EGRESO').reduce((acc, curr) => acc + (curr.monto || 0), 0);
  const balance = totalIncome - totalExpense;
  const filteredTransactions = transactions.filter(t => filterType === 'TODOS' ? true : t.tipo === filterType);
  const formatCurrency = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Finanzas</h1>
          <p className="text-gray-500 text-sm">Resumen de ingresos y gastos</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Ingresos Totales</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Egresos Totales</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Balance Actual</p>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
          {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition ${filterType === type ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {type}
              </button>
          ))}
      </div>

      {/* Tabla de Transacciones */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold">Categoría</th>
              <th className="p-4 font-semibold text-right">Monto</th>
              <th className="p-4 font-semibold text-center">Tipo</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-600 text-sm whitespace-nowrap">
                    {/* Convertimos fecha ISO a local */}
                    {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}
                </td>
                <td className="p-4 text-gray-800 font-medium">{item.descripcion}</td>
                <td className="p-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                        {item.categoria || 'General'}
                    </span>
                </td>
                <td className={`p-4 text-right font-bold whitespace-nowrap ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.tipo === 'EGRESO' ? '-' : '+'} {formatCurrency(item.monto)}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${item.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {item.tipo}
                  </span>
                </td>
                
                {/* Botones de Acción */}
                <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg transition" title="Editar">
                            ✏️
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
              </tr>
            ))}
            
            {!loading && filteredTransactions.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center text-gray-400">No hay movimientos registrados.</td></tr>
            )}
          </tbody>
        </table>
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