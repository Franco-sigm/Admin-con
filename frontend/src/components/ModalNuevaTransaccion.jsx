import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const CATEGORIAS_INGRESO = ['Pago Gastos Comunes', 'Pago Multas', 'Arriendo Quincho/Sala', 'Otros Ingresos'];
const CATEGORIAS_EGRESO = ['Mantención', 'Servicios Básicos (Luz/Agua)', 'Sueldos', 'Insumos de Aseo', 'Reparaciones', 'Otros Gastos'];
const METODOS_PAGO = ['TRANSFERENCIA', 'EFECTIVO', 'WEBPAY', 'OTRO'];

const ModalNuevaTransaccion = ({ isOpen, onClose, onSave, transactionToEdit }) => {
  const { id: comunidadId } = useParams(); // Rescatamos el ID de la comunidad de la URL
  
  const [formData, setFormData] = useState({
    id: null,
    tipo: 'INGRESO',
    propiedad_id: '',
    metodo_pago: 'TRANSFERENCIA',
    descripcion: 'Pago de Gastos Comunes',
    categoria: 'Pago Gastos Comunes',
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Estados para la magia de la automatización
  const [residentes, setResidentes] = useState([]);
  const [deudaPendiente, setDeudaPendiente] = useState(null);
  const [cargandoDeuda, setCargandoDeuda] = useState(false);

  // 1. Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      if (comunidadId) cargarResidentes();

      if (transactionToEdit) {
        setFormData({
          id: transactionToEdit.id,
          tipo: transactionToEdit.tipo,
          propiedad_id: transactionToEdit.propiedad_id || '',
          metodo_pago: transactionToEdit.metodo_pago || 'TRANSFERENCIA',
          descripcion: transactionToEdit.descripcion,
          categoria: transactionToEdit.categoria || '',
          monto: transactionToEdit.monto_total || transactionToEdit.monto,
          fecha: transactionToEdit.fecha ? transactionToEdit.fecha.split('T')[0] : new Date().toISOString().split('T')[0]
        });
      } else {
        setFormData({
          id: null,
          tipo: 'INGRESO',
          propiedad_id: '',
          metodo_pago: 'TRANSFERENCIA',
          descripcion: 'Pago de Gastos Comunes',
          categoria: 'Pago Gastos Comunes',
          monto: '',
          fecha: new Date().toISOString().split('T')[0]
        });
        setDeudaPendiente(null);
      }
    }
  }, [isOpen, transactionToEdit, comunidadId]);

  // 2. Traer los departamentos para el selector
  const cargarResidentes = async () => {
    try {
      // (Opcional) Si usas token en este endpoint:
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await api.get(`/api/residentes/comunidad/${comunidadId}`, config);
      
      if (Array.isArray(res.data)) {
          // Desenrollamos a los residentes con sus múltiples propiedades
          const opcionesFormateadas = res.data.flatMap(residente => {
              if (residente.propiedades && residente.propiedades.length > 0) {
                  return residente.propiedades.map(prop => ({
                      propiedad_id: prop.id,          
                      numero_unidad: prop.numero_unidad,
                      nombre: residente.nombre
                  }));
              }
              return []; // Si no tiene propiedad, lo ignoramos para los pagos
          });
          
          setResidentes(opcionesFormateadas);
      }
    } catch (e) { 
        console.error("Error cargando departamentos", e); 
    }
  };

  // 3. LA MAGIA: Al elegir un departamento, buscamos su deuda real
  const handlePropiedadChange = async (e) => {
    const propId = e.target.value;
    setFormData(prev => ({ ...prev, propiedad_id: propId }));
    
    if (propId && formData.tipo === 'INGRESO') {
       setCargandoDeuda(true);
       try {
          const res = await api.get(`/api/finanzas/propiedades/${propId}/deudas`);
          
          // Calculamos cuánto debe en total sumando los montos de los cargos devueltos
          let sumaDeuda = 0;
          if (Array.isArray(res.data)) {
              sumaDeuda = res.data.reduce((acc, cargo) => acc + (cargo.monto || 0), 0);
          }
          
          setDeudaPendiente(sumaDeuda);
          
          // Autocompletamos el monto en el formulario para ahorrarle trabajo al admin
          setFormData(prev => ({ 
              ...prev, 
              monto: sumaDeuda > 0 ? sumaDeuda : '' 
          }));

       } catch(error) {
          console.error("Error buscando deuda", error);
          setDeudaPendiente(0);
       } finally {
          setCargandoDeuda(false);
       }
    } else {
       setDeudaPendiente(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ 
      ...prev, 
      tipo: newType, 
      categoria: newType === 'INGRESO' ? 'Pago Gastos Comunes' : '',
      descripcion: newType === 'INGRESO' ? 'Pago de Gastos Comunes' : '',
      propiedad_id: '' // Reseteamos el depto si cambia de tipo
    }));
    setDeudaPendiente(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoria) { alert("⚠️ Falta seleccionar la CATEGORÍA."); return; }
    if (!formData.monto || Number(formData.monto) <= 0) { alert("⚠️ El MONTO debe ser mayor a 0."); return; }
    if (formData.tipo === 'INGRESO' && !formData.propiedad_id) { alert("⚠️ Debes seleccionar una unidad que está pagando."); return; }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-fade-in-down">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {transactionToEdit ? 'Editar Movimiento' : 'Registrar Movimiento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Selector de Tipo (Ingreso / Egreso) */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('INGRESO')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                formData.tipo === 'INGRESO' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              INGRESO (Pago)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EGRESO')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                formData.tipo === 'EGRESO' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              EGRESO (Gasto)
            </button>
          </div>

          {/* Si es INGRESO, mostramos el selector de Departamento y el cuadro de Deuda */}
          {formData.tipo === 'INGRESO' && (
             <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-1">Unidad que realiza el pago</label>
                  <select name="propiedad_id" value={formData.propiedad_id} onChange={handlePropiedadChange} className="w-full px-4 py-2 border border-emerald-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Selecciona el departamento...</option>
                    {residentes.map((item) => (
                      <option key={item.propiedad_id} value={item.propiedad_id}>
                         Unidad {item.numero_unidad} - {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                

                {/* Panel Inteligente de Deuda */}
                {cargandoDeuda ? (
                   <p className="text-xs text-emerald-600 animate-pulse">Consultando deuda en el sistema...</p>
                ) : deudaPendiente !== null ? (
                   <div className="flex items-center justify-between bg-white p-3 rounded border border-emerald-200 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Deuda actual calculada:</span>
                      <span className={`font-bold ${deudaPendiente > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {deudaPendiente > 0 ? `$${deudaPendiente.toLocaleString('es-CL')}` : '¡Al Día! ($0)'}
                      </span>
                   </div>
                ) : null}
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Monto ($)</label>
              <input type="number" name="monto" min="1" value={formData.monto} onChange={handleChange} placeholder="Ej: 50000" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Método de Pago</label>
              <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo} value={metodo}>{metodo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Selecciona...</option>
                {(formData.tipo === 'INGRESO' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Breve</label>
            <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Ej: Pago GC Enero" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" className={`flex-1 px-4 py-2 text-white font-bold rounded-lg shadow-md transition transform hover:-translate-y-0.5 ${formData.tipo === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
              {transactionToEdit ? 'Actualizar' : 'Guardar Transacción'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalNuevaTransaccion;