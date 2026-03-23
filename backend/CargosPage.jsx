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
  const [verPagados, setVerPagados] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    fecha_vencimiento: ''
  });

  useEffect(() => {
    setSelectedPropiedadId('');
    setCargos([]);
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
      const response = await api.get(`/api/propiedades/comunidad/${id}?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        fecha_vencimiento: cargo.fecha_vencimiento ? cargo.fecha_vencimiento.split('T')[0] : ''
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
    if (monto === undefined || monto === null || isNaN(monto)) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
  };

  const propiedadActual = propiedades.find(p => p.id.toString() === selectedPropiedadId);

  const cargosFiltrados = cargos.filter(cargo => verPagados ? true : cargo.estado !== 'PAGADO');

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

      {/* --- BARRA DE HERRAMIENTAS --- */}
      <div className="bg-gradient-to-b from-white to-gray-50/80 p-5 rounded-2xl border border-gray-200/80 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.08)] flex flex-col md:flex-row items-center gap-4 justify-between transition-all">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <select 
                    className="pl-9 pr-8 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
                    value={selectedPropiedadId}
                    onChange={(e) => setSelectedPropiedadId(e.target.value)}
                >
                    <option value="">-- Buscar departamento --</option>
                    {propiedades.map(prop => (
                    <option key={prop.id} value={prop.id}>Unidad {prop.numero_unidad}</option>
                    ))}
                </select>
            </div>
            
            {propiedadActual && (
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100/80 border border-gray-200/50 rounded-xl shadow-inner">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">Unidad {propiedadActual.numero_unidad}</span>
                </div>
            )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setVerPagados(!verPagados)}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${verPagados ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {verPagados ? 'Ocultar Pagados' : 'Ver Historial'}
          </button>

          {selectedPropiedadId && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-medium active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nuevo Cargo
            </button>
          )}
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {selectedPropiedadId ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest border-b">
                <tr>
                  <th className="p-4 font-semibold">Concepto</th>
                  <th className="p-4 font-semibold">Vencimiento</th>
                  <th className="p-4 font-semibold text-right">Monto</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                      <td colSpan="5" className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <p className="text-sm font-medium">Cargando cuenta...</p>
                          </div>
                      </td>
                  </tr>
            ) : cargosFiltrados.length === 0 ? (
                  <tr>
                      <td colSpan="5" className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                              <AlertCircle className="w-8 h-8 opacity-20" />
                          <p className="text-sm font-semibold text-gray-900">No hay cargos para mostrar</p>
                          </div>
                      </td>
                  </tr>
                ) : (
              cargosFiltrados.map((cargo) => {
                      // 🚀 LÓGICA DE SALDO PENDIENTE
                      const totalPagado = cargo.pagos_aplicados?.reduce((acc, p) => acc + p.monto_abonado, 0) || 0;
                      const saldoPendiente = cargo.monto - totalPagado;

                      return (
                        <tr key={cargo.id} className={`transition-colors group ${cargo.estado === 'ANULADO' ? 'bg-gray-50/50' : 'hover:bg-gray-50/80'}`}>
                          <td className={`p-4 font-semibold text-sm flex items-center gap-3 ${cargo.estado === 'ANULADO' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            <div className="p-1.5 rounded-lg border bg-white border-gray-200">
                                <FileText size={14} className="text-gray-600" />
                            </div>
                            {cargo.concepto}
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              {cargo.fecha_vencimiento}
                            </div>
                          </td>
                          <td className="p-4 text-right font-bold whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className={cargo.estado === 'ANULADO' ? 'text-gray-400 line-through' : 'text-gray-900'}>
                                    {formatearDinero(saldoPendiente)}
                                </span>
                                {cargo.estado === 'PARCIAL' && (
                                    <span className="text-[10px] text-gray-400 font-medium italic">
                                        Faltan de {formatearDinero(cargo.monto)}
                                    </span>
                                )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-widest border ${
                              cargo.estado === 'PENDIENTE' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              cargo.estado === 'PAGADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              cargo.estado === 'ANULADO' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {cargo.estado}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {cargo.estado === 'PENDIENTE' || cargo.estado === 'PARCIAL' ? (
                              <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(cargo)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg transition-all">
                                  <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleAnular(cargo)} className="text-gray-400 hover:text-rose-600 p-2 rounded-lg transition-all">
                                  <Ban size={16} />
                                </button>
                              </div>
                            ) : (
                                <span className="text-[10px] text-gray-300 uppercase font-semibold">Cerrado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 p-16 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Selecciona una unidad</h3>
            <p className="text-sm text-gray-500">Busca el departamento en la barra superior para ver su estado de cuenta.</p>
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCargo ? 'Editar Cargo' : 'Registrar Nuevo Cargo'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Concepto</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.concepto} onChange={(e) => setFormData({...formData, concepto: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Monto (CLP)</label>
                <input type="number" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Vencimiento</label>
                <input type="date" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" value={formData.fecha_vencimiento} onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargosPage;
