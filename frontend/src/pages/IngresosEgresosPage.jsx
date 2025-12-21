import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModalNuevaTransaccion from '../components/ModalNuevaTransaccion';

const IngresosEgresosPage = () => {
  const { id } = useParams(); // ID de la comunidad
  const [transactions, setTransactions] = useState([]); // Array vacío al inicio
  const [filterType, setFilterType] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS REALES AL INICIAR
  useEffect(() => {
    fetchTransactions();
  }, [id]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/transacciones/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha (más reciente primero)
        const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setTransactions(sortedData);
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. GUARDAR DATO REAL (POST)
  const handleSaveTransaction = async (nuevaData) => {
    // Preparar el objeto tal cual lo pide el esquema de Pydantic
    const transactionPayload = {
      comunidad_id: parseInt(id),
      tipo: nuevaData.tipo,
      descripcion: nuevaData.descripcion,
      categoria: nuevaData.categoria,
      monto: parseInt(nuevaData.monto),
      fecha: nuevaData.fecha
    };

    try {
      const response = await fetch('http://localhost:8000/transacciones/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionPayload),
      });

      if (response.ok) {
        // Opción A: Recargar todo desde el servidor (Más seguro)
        fetchTransactions(); 
        setIsModalOpen(false);
      } else {
        alert("Error al guardar. Revisa la consola.");
        console.error(await response.text());
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  // Cálculos financieros (Igual que antes)
  const totalIncome = transactions.filter(t => t.tipo === 'INGRESO').reduce((acc, curr) => acc + curr.monto, 0);
  const totalExpense = transactions.filter(t => t.tipo === 'EGRESO').reduce((acc, curr) => acc + curr.monto, 0);
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
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition duration-200 flex items-center gap-2"
        >
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
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

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* CABECERA DE LA TABLA */}
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Descripción</th>
              <th className="p-4 font-semibold">Categoría</th>
              <th className="p-4 font-semibold text-right">Monto</th>
              <th className="p-4 font-semibold text-center">Tipo</th>
            </tr>
          </thead>

          {/* CUERPO DE LA TABLA (Aquí ocurre el renderizado) */}
          <tbody className="divide-y divide-gray-100">
            
            {/* 1. Usamos .map() para recorrer el array de transacciones */}
            {filteredTransactions.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                
                {/* FECHA */}
                <td className="p-4 text-gray-600 text-sm whitespace-nowrap">
                  {/* Si quieres formatear la fecha a DD/MM/AAAA, puedes usar una función auxiliar aquí */}
                  {item.fecha} 
                </td>

                {/* DESCRIPCIÓN */}
                <td className="p-4 text-gray-800 font-medium">
                  {item.descripcion}
                </td>

                {/* CATEGORÍA (Con etiqueta gris) */}
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                    {item.categoria || 'General'}
                  </span>
                </td>

                {/* MONTO (Verde para Ingreso, Rojo para Egreso) */}
                <td className={`p-4 text-right font-bold whitespace-nowrap ${
                    item.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {/* Signo más o menos dependiendo del tipo */}
                  {item.tipo === 'EGRESO' ? '-' : '+'} 
                  {formatCurrency(item.monto)}
                </td>

                {/* TIPO (Badge/Etiqueta de color) */}
                <td className="p-4 text-center">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                    item.tipo === 'INGRESO' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.tipo}
                  </span>
                </td>
              </tr>
            ))}

            {/* MENSAJE SI LA LISTA ESTÁ VACÍA */}
            {!loading && filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📭</span>
                    <p>No se encontraron movimientos.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalNuevaTransaccion 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};

export default IngresosEgresosPage;