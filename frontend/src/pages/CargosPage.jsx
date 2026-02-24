import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { DollarSign, Plus, FileText, Calendar, AlertCircle, Edit2, Ban } from 'lucide-react';

const CargosPage = () => {
  const { id } = useParams(); 
  const [propiedades, setPropiedades] = useState([]);
  const [selectedPropiedadId, setSelectedPropiedadId] = useState('');
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    fetchPropiedades();
  }, [id]);

  useEffect(() => {
    if (selectedPropiedadId) {
      fetchCargos(selectedPropiedadId);
    } else {
      setCargos([]);
    }
  }, [selectedPropiedadId]);

  const fetchPropiedades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/propiedades/comunidad/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPropiedades(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar propiedades:", error);
    }
  };

  const fetchCargos = async (propId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/cargos/propiedad/${propId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCargos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar cargos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cargo = null) => {
    if (cargo) {
      setEditingCargo(cargo);
      setFormData({
        monto: cargo.monto,
        concepto: cargo.concepto,
        fecha_vencimiento: cargo.fecha_vencimiento
      });
    } else {
      setEditingCargo(null);
      setFormData({ monto: '', concepto: '', fecha_vencimiento: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monto || !formData.concepto || !formData.fecha_vencimiento || !selectedPropiedadId) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const payload = {
      propiedad_id: parseInt(selectedPropiedadId),
      monto: parseInt(formData.monto),
      concepto: formData.concepto,
      fecha_vencimiento: formData.fecha_vencimiento,
      estado: editingCargo ? editingCargo.estado : 'PENDIENTE'
    };

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingCargo) {
        await api.put(`/api/cargos/${editingCargo.id}`, payload, config);
        alert("✅ Cargo actualizado exitosamente");
      } else {
        await api.post('/api/cargos', payload, config);
        alert("✅ Cargo registrado exitosamente");
      }
      
      setIsModalOpen(false);
      fetchCargos(selectedPropiedadId);
    } catch (error) {
      console.error("Error al guardar cargo:", error);
      alert(error.response?.data?.detail || "Hubo un error al guardar el cargo.");
    }
  };

  const handleAnular = async (cargo) => {
    if (!window.confirm(`¿Seguro que deseas ANULAR el cargo de ${cargo.concepto}? Esta acción lo marcará como inactivo.`)) return;
    
    const payload = {
      propiedad_id: cargo.propiedad_id,
      monto: cargo.monto,
      concepto: cargo.concepto,
      fecha_vencimiento: cargo.fecha_vencimiento,
      estado: 'ANULADO' // Mágia: cambiamos el estado en lugar de borrar
    };

    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/cargos/${cargo.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCargos(selectedPropiedadId);
    } catch (error) {
      alert(error.response?.data?.detail || "Error al anular el cargo.");
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Gestión de Cargos y Deudas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra cobros, corrige errores y anula registros inválidos.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <label className="font-medium text-gray-700">Seleccionar Propiedad:</label>
        <select 
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
          value={selectedPropiedadId}
          onChange={(e) => setSelectedPropiedadId(e.target.value)}
        >
          <option value="">-- Elige un departamento --</option>
          {propiedades.map(prop => (
            <option key={prop.id} value={prop.id}>{prop.numero_unidad}</option>
          ))}
        </select>

        {selectedPropiedadId && (
          <button 
            onClick={() => handleOpenModal()}
            className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus size={18} />
            Nuevo Cargo
          </button>
        )}
      </div>

      {selectedPropiedadId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Concepto</th>
                <th className="p-4 font-semibold">Vencimiento</th>
                <th className="p-4 font-semibold text-right">Monto</th>
                <th className="p-4 font-semibold text-center">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">Cargando cuentas...</td></tr>
              ) : cargos.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500 flex flex-col items-center gap-2"><AlertCircle size={24} className="text-gray-300"/>Esta propiedad no tiene movimientos.</td></tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.id} className={`transition-colors ${cargo.estado === 'ANULADO' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                    <td className={`p-4 font-medium flex items-center gap-2 ${cargo.estado === 'ANULADO' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      <FileText size={16} className={cargo.estado === 'ANULADO' ? 'text-gray-300' : 'text-gray-400'} />
                      {cargo.concepto}
                    </td>
                    <td className={`p-4 ${cargo.estado === 'ANULADO' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {cargo.fecha_vencimiento}
                      </div>
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${cargo.estado === 'ANULADO' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {formatearDinero(cargo.monto)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        cargo.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' : 
                        cargo.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 
                        cargo.estado === 'ANULADO' ? 'bg-gray-200 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {cargo.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {cargo.estado === 'PENDIENTE' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(cargo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar Cargo"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleAnular(cargo)}
                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded-lg"
                            title="Anular Cargo"
                          >
                            <Ban size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          👆 Selecciona una propiedad arriba para ver sus deudas.
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingCargo ? 'Editar Cargo' : 'Registrar Nuevo Cargo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <input 
                  type="text" required
                  placeholder="Ej: Multa por ruidos"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.concepto}
                  onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (CLP)</label>
                <input 
                  type="number" required min="0"
                  placeholder="Ej: 45000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input 
                  type="date" required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm">
                  {editingCargo ? 'Guardar Cambios' : 'Registrar Cargo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargosPage;