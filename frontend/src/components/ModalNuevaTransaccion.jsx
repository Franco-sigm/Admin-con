import React, { useState, useEffect } from 'react';

const CATEGORIAS_INGRESO = ['Gastos Comunes', 'Multas', 'Arriendo Quincho/Sala', 'Otros Ingresos'];
const CATEGORIAS_EGRESO = ['Mantención', 'Servicios Básicos (Luz/Agua)', 'Sueldos', 'Insumos de Aseo', 'Reparaciones', 'Otros Gastos'];

const ModalNuevaTransaccion = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tipo: 'EGRESO',
    descripcion: '',
    categoria: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: 'EGRESO',
        descripcion: '',
        categoria: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, tipo: newType, categoria: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. DIAGNÓSTICO EN CONSOLA (Presiona F12 para ver esto)
    console.log("🟢 CLICK EN GUARDAR DETECTADO");
    console.log("Datos del formulario:", formData);

    // 2. VALIDACIÓN MANUAL
    // Si falta la categoría, mostramos alerta y detenemos todo.
    if (!formData.categoria) {
        alert("⚠️ Falta seleccionar la CATEGORÍA.");
        return; 
    }

    if (!formData.descripcion.trim()) {
        alert("⚠️ Falta agregar una DESCRIPCIÓN.");
        return;
    }

    if (!formData.monto || Number(formData.monto) <= 0) {
        alert("⚠️ El MONTO debe ser mayor a 0.");
        return;
    }

    // 3. ENVIAR AL PADRE
    const dataToSend = {
      ...formData,
      monto: Number(formData.monto)
    };

    console.log("🚀 Enviando datos a IngresosEgresosPage...", dataToSend);
    onSave(dataToSend);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Registrar Movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('INGRESO')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${
                formData.tipo === 'INGRESO' 
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              INGRESO
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EGRESO')}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${
                formData.tipo === 'EGRESO' 
                  ? 'bg-white text-rose-600 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              EGRESO
            </button>
          </div>

          {/* Monto (SIN REQUIRED) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              name="monto"
              min="1"
              value={formData.monto}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Ej: 50000"
            />
          </div>

          {/* Categoría (SIN REQUIRED) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Selecciona una categoría...</option>
              {(formData.tipo === 'INGRESO' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Descripción (SIN REQUIRED) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Detalle del movimiento..."
            />
          </div>

          {/* Fecha (SIN REQUIRED) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Footer Botones */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium shadow-md ${
                formData.tipo === 'INGRESO' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Guardar {formData.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalNuevaTransaccion;