import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';

const IngresosEgresosPage = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // <--- NUEVO ESTADO
  const [loading, setLoading] = useState(true);

  // MODO LOCAL
  const API_URL = 'http://localhost:5000'; 
  // MODO PRODUCCIÓN
  // const API_URL = 'https://api.surcode.cl'; 

  useEffect(() => {
    fetchTransactions();
  }, [id]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/transacciones/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setTransactions(sortedData);
      } else {
        console.error("Error del servidor:", await response.text());
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIÓN UNIFICADA: CREAR Y EDITAR ---
  const handleSaveTransaction = async (dataFormulario) => {
    const token = localStorage.getItem('token');
    
    // Si tiene ID, es una EDICIÓN (PUT). Si no, es CREACIÓN (POST).
    const method = dataFormulario.id ? 'PUT' : 'POST';
    
    // Si es edición, la URL lleva el ID de la transacción. Si es nuevo, la URL es base.
    // OJO: Asumo que en Flask definimos PUT en /transacciones/<id_transaccion>
    // Si no tienes esa ruta en Flask, avísame.
    const url = dataFormulario.id 
        ? `${API_URL}/transacciones/${dataFormulario.id}` 
        : `${API_URL}/transacciones`;

    // Preparamos payload (asegurando comunidad_id)
    const payload = {
      ...dataFormulario,
      comunidad_id: parseInt(id)
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchTransactions(); // Recargar lista
        setIsModalOpen(false);
        setEditingTransaction(null); // Limpiar estado de edición
      } else {
        const errorMsg = await response.json();
        alert(`Error: ${errorMsg.detail || "No se pudo guardar"}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async (transaccionId) => {
    if(!window.confirm("¿Estás seguro de que quieres eliminar este registro?")) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/transacciones/${transaccionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("🗑️ Registro eliminado");
            fetchTransactions();
        } else {
            alert("No se pudo eliminar.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
  };

  // --- FUNCIÓN PARA ABRIR MODAL EN MODO EDICIÓN ---
  const openEditModal = (transaccion) => {
    setEditingTransaction(transaccion); // Guardamos el objeto a editar
    setIsModalOpen(true);
  };

  // --- FUNCIÓN PARA ABRIR MODAL NUEVO ---
  const openNewModal = () => {
    setEditingTransaction(null); // Nos aseguramos que esté limpio
    setIsModalOpen(true);
  };

  // Cálculos
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
          <p className="text-gray-500 text-sm">Comunidad #{id}</p>
        </div>
        <button 
          onClick={openNewModal} // Usamos la nueva función
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {/* Tarjetas (Sin cambios) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Ingresos</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Egresos</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium uppercase">Balance</p>
          <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
          {['TODOS', 'INGRESO', 'EGRESO'].map(type => (
              <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition ${filterType === type ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {type}
              </button>
          ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold">Categoría</th>
              <th className="p-4 font-semibold text-right">Monto</th>
              <th className="p-4 font-semibold text-center">Tipo</th>
              <th className="p-4 font-semibold text-center">Acciones</th> {/* <--- NUEVA COLUMNA */}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{new Date(item.fecha).toLocaleDateString()}</td>
                <td className="p-4 text-gray-800 font-medium">{item.descripcion}</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{item.categoria || 'General'}</span></td>
                <td className={`p-4 text-right font-bold whitespace-nowrap ${item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.tipo === 'EGRESO' ? '-' : '+'} {formatCurrency(item.monto)}
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${item.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {item.tipo}
                  </span>
                </td>
                
                {/* --- NUEVA CELDA DE ACCIONES --- */}
                <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button 
                            onClick={() => openEditModal(item)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg transition"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition"
                            title="Eliminar"
                        >
                            🗑️
                        </button>
                    </div>
                </td>

              </tr>
            ))}
            {!loading && filteredTransactions.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center text-gray-400">No hay movimientos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalNuevaTransaccion 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction} // <--- PASAMOS EL DATO A EDITAR
      />
    </div>
  );
};

export default IngresosEgresosPage;