import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { DollarSign, Plus, FileText, Calendar, AlertCircle, Edit2, Ban, Search, Home } from 'lucide-react';

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
      // 🚀 CORRECCIÓN 1: Pedimos un límite alto (ej: 1000) para cargar todas las unidades en el selector
      const response = await api.get(`/api/propiedades/comunidad/${id}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 🚀 CORRECCIÓN 2: Leemos inteligentemente la propiedad 'items' si existe
      const lista = response.data.items || (Array.isArray(response.data) ? response.data : []);
      
      setPropiedades(lista);
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
      estado: 'ANULADO' 
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

  // Helper para saber si una propiedad está seleccionada
  const propiedadActual = propiedades.find(p => p.id.toString() === selectedPropiedadId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-down pb-12 p-6">
      
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-100 shadow-sm">
                <DollarSign className="w-7 h-7 text-emerald-600" />
            </div>
            Gestión de Cargos
          </h1>
          <p className="text-gray-500 text-sm mt-2">Administra cobros, corrige errores y anula registros inválidos por unidad.</p>
        </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS (Toolbar Premium) --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 p-5 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] flex flex-col md:flex-row items-center gap-4 justify-between transition-all duration-300 hover:shadow-[0_12px_20px_-8px_rgba(16,24,40,0.12)]">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <select 
                    className="pl-9 pr-8 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                    value={selectedPropiedadId}
                    onChange={(e) => setSelectedPropiedadId(e.target.value)}
                >
                    <option value="">-- Buscar departamento --</option>
                    {propiedades.map(prop => (
                    <option key={prop.id} value={prop.id}>Unidad {prop.numero_unidad}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            
            {propiedadActual && (
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100/80 border border-gray-200/50 rounded-xl shadow-inner">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">Unidad {propiedadActual.numero_unidad}</span>
                </div>
            )}
        </div>

        {selectedPropiedadId && (
          <button 
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-md shadow-gray-900/20 transition-all duration-200 flex items-center justify-center gap-2 font-medium active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cargo
          </button>
        )}
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {selectedPropiedadId ? (
        <div className="bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-200/80">
                <tr>
                  <th className="p-4 font-semibold">Concepto</th>
                  <th className="p-4 font-semibold">Vencimiento</th>
                  <th className="p-4 font-semibold text-right">Monto</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80 bg-white">
                {loading ? (
                  <tr>
                      <td colSpan="5" className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <p className="text-sm font-medium animate-pulse">Cargando cuenta de la unidad...</p>
                          </div>
                      </td>
                  </tr>
                ) : cargos.length === 0 ? (
                  <tr>
                      <td colSpan="5" className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2">
                                  <AlertCircle className="w-5 h-5 text-gray-300" />
                              </div>
                              <p className="text-sm font-semibold text-gray-900">No hay cargos registrados</p>
                              <p className="text-xs">Esta propiedad tiene su historial limpio.</p>
                          </div>
                      </td>
                  </tr>
                ) : (
                  cargos.map((cargo) => (
                    <tr key={cargo.id} className={`transition-colors group ${cargo.estado === 'ANULADO' ? 'bg-gray-50/50' : 'hover:bg-gray-50/80'}`}>
                      <td className={`p-4 font-semibold text-sm flex items-center gap-3 ${cargo.estado === 'ANULADO' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        <div className={`p-1.5 rounded-lg border ${cargo.estado === 'ANULADO' ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-200 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,1)]'}`}>
                             <FileText size={14} className={cargo.estado === 'ANULADO' ? 'text-gray-400' : 'text-gray-600'} />
                        </div>
                        {cargo.concepto}
                      </td>
                      <td className={`p-4 text-sm font-medium ${cargo.estado === 'ANULADO' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400 opacity-70" />
                          {cargo.fecha_vencimiento}
                        </div>
                      </td>
                      <td className={`p-4 text-right font-bold whitespace-nowrap ${cargo.estado === 'ANULADO' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {formatearDinero(cargo.monto)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border shadow-[inset_0_1px_0_rgba(255,255,255,1)] ${
                          cargo.estado === 'PENDIENTE' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          cargo.estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          cargo.estado === 'ANULADO' ? 'bg-gray-100 text-gray-500 border-gray-200 shadow-none' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {cargo.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {cargo.estado === 'PENDIENTE' ? (
                          <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(cargo)}
                              className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                              title="Editar Cargo"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleAnular(cargo)}
                              className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all"
                              title="Anular Cargo"
                            >
                              <Ban size={16} />
                            </button>
                          </div>
                        ) : (
                            <span className="text-[10px] text-gray-300 uppercase font-semibold tracking-wider">Sin Acciones</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State Principal */
        <div className="border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 p-16 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-gray-50 hover:border-gray-300 cursor-default">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                <Search className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Busca una unidad</h3>
            <p className="text-sm text-gray-500 max-w-sm">Utiliza el selector en la parte superior para elegir un departamento y ver su historial de cargos.</p>
        </div>
      )}

      {/* --- MODAL PREMIUM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform">
            
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                {editingCargo ? 'Editar Cargo' : 'Registrar Nuevo Cargo'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Concepto</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                    type="text" required
                    placeholder="Ej: Multa por ruidos"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.concepto}
                    onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                    />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Monto (CLP)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                    type="number" required min="0"
                    placeholder="45000"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fecha de Vencimiento</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all active:scale-95">
                  {editingCargo ? 'Guardar Cambios' : 'Emitir Cargo'}
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