import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { 
  DollarSign, Home, CreditCard, Tag, Calendar, AlignLeft, 
  TrendingUp, TrendingDown, X, AlertCircle, CheckCircle2,
  Upload, FileText, Paperclip
} from 'lucide-react';

const CATEGORIAS_INGRESO = ['Pago Gastos Comunes', 'Pago Multas', 'Arriendo Quincho/Sala', 'Otros Ingresos'];
const CATEGORIAS_EGRESO = ['Mantención', 'Servicios Básicos (Luz/Agua)', 'Sueldos', 'Insumos de Aseo', 'Reparaciones', 'Otros Gastos'];
const METODOS_PAGO = ['TRANSFERENCIA', 'EFECTIVO', 'WEBPAY', 'OTRO'];

const ModalNuevaTransaccion = ({ isOpen, onClose, onSave, transactionToEdit }) => {
  const { id: comunidadId } = useParams(); 
  
  const [formData, setFormData] = useState({
    id: null,
    tipo: 'INGRESO',
    propiedad_id: '',
    metodo_pago: 'TRANSFERENCIA',
    descripcion: 'Pago de Gastos Comunes',
    categoria: CATEGORIAS_INGRESO[0],
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [archivo, setArchivo] = useState(null); // 👈 NUEVO: Estado para el binario del archivo
  const [previewName, setPreviewName] = useState(""); // 👈 NUEVO: Para mostrar el nombre del archivo seleccionado
  const [residentes, setResidentes] = useState([]);
  const [deudaPendiente, setDeudaPendiente] = useState(null);
  const [cargandoDeuda, setCargandoDeuda] = useState(false);
  const [mantenerAbierto, setMantenerAbierto] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (comunidadId) cargarResidentes();
      setArchivo(null); // Reset archivo al abrir
      setPreviewName("");
      if (transactionToEdit) {
        setFormData({
          id: transactionToEdit.id,
          tipo: transactionToEdit.tipo,
          propiedad_id: transactionToEdit.propiedad_id || '',
          metodo_pago: transactionToEdit.metodo_pago || 'TRANSFERENCIA',
          descripcion: transactionToEdit.descripcion,
          categoria: transactionToEdit.categoria || (transactionToEdit.tipo === 'INGRESO' ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0]),
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
          categoria: CATEGORIAS_INGRESO[0],
          monto: '',
          fecha: new Date().toISOString().split('T')[0]
        });
        setDeudaPendiente(null);
      }
    }
  }, [isOpen, transactionToEdit, comunidadId]);

  const cargarResidentes = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await api.get(`/api/residentes/comunidad/${comunidadId}?limit=1000`, config);
      const dataResidentes = res.data.items || (Array.isArray(res.data) ? res.data : []);
      if (dataResidentes.length > 0) {
          const opcionesFormateadas = dataResidentes.flatMap(residente => {
              if (residente.propiedades && residente.propiedades.length > 0) {
                  return residente.propiedades.map(prop => ({
                      propiedad_id: prop.id,          
                      numero_unidad: prop.numero_unidad,
                      nombre: residente.nombre
                  }));
              }
              return []; 
          });
          setResidentes(opcionesFormateadas);
      }
    } catch (e) { console.error("Error cargando departamentos", e); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      setPreviewName(file.name);
    }
  };

  const handlePropiedadChange = async (e) => {
    const propId = e.target.value;
    setFormData(prev => ({ ...prev, propiedad_id: propId }));
    if (propId && formData.tipo === 'INGRESO') {
       setCargandoDeuda(true);
       try {
          const res = await api.get(`/api/finanzas/propiedades/${propId}/deudas`);
          let sumaDeuda = 0;
          if (Array.isArray(res.data)) {
              sumaDeuda = res.data.reduce((acc, cargo) => acc + (cargo.monto || 0), 0);
          }
          setDeudaPendiente(sumaDeuda);
          setFormData(prev => ({ ...prev, monto: sumaDeuda > 0 ? sumaDeuda : '' }));
       } catch(error) {
          setDeudaPendiente(0);
       } finally { setCargandoDeuda(false); }
    } else { setDeudaPendiente(null); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ 
      ...prev, 
      tipo: newType, 
      categoria: newType === 'INGRESO' ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0],
      descripcion: newType === 'INGRESO' ? 'Pago de Gastos Comunes' : '',
      propiedad_id: '' 
    }));
    setDeudaPendiente(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria) return;
    if (!formData.monto || Number(formData.monto) <= 0) return;

    // 🚀 ENVIAR AL PADRE EL FORMULARIO + EL ARCHIVO
    onSave(formData, archivo); 

    if (mantenerAbierto) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFormData(prev => ({ ...prev, monto: '', descripcion: '', propiedad_id: '' }));
      setDeudaPendiente(null);
      setArchivo(null); // Limpiar archivo tras guardar
      setPreviewName("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden transform scale-100 transition-all relative">
        
        {showSuccess && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">¡Movimiento Registrado!</span>
            </div>
          </div>
        )}

        <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${formData.tipo === 'INGRESO' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {transactionToEdit ? 'Editar Movimiento' : 'Registrar Movimiento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50 shadow-inner">
            <button type="button" onClick={() => handleTypeChange('INGRESO')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${formData.tipo === 'INGRESO' ? 'bg-white text-emerald-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}><TrendingUp className="w-4 h-4" /> INGRESO</button>
            <button type="button" onClick={() => handleTypeChange('EGRESO')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${formData.tipo === 'EGRESO' ? 'bg-white text-rose-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}><TrendingDown className="w-4 h-4" /> EGRESO</button>
          </div>

          {formData.tipo === 'INGRESO' && (
             <div className="space-y-4 p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 rounded-2xl border border-emerald-100/80">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">Unidad</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Home className="h-4 w-4 text-emerald-500/70" /></div>
                     <select name="propiedad_id" value={formData.propiedad_id} onChange={handlePropiedadChange} className="w-full pl-10 pr-8 py-2.5 bg-white border border-emerald-200/80 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer">
                       <option value="">Seleccionar departamento...</option>
                       {residentes.map((item) => <option key={item.propiedad_id} value={item.propiedad_id}>Unidad {item.numero_unidad} - {item.nombre}</option>)}
                     </select>
                  </div>
                </div>
                {deudaPendiente !== null && (
                   <div className="flex items-center justify-between h-10 bg-white px-4 rounded-xl border border-emerald-200/60 shadow-sm">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Deuda:</span>
                      <span className={`text-sm font-bold ${deudaPendiente > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>${deudaPendiente.toLocaleString('es-CL')}</span>
                   </div>
                )}
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Monto ($)</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DollarSign className="h-4 w-4 text-gray-400" /></div>
                  <input type="number" name="monto" value={formData.monto} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Método</label>
              <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white">
                {METODOS_PAGO.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white">
                {(formData.tipo === 'INGRESO' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Descripción</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AlignLeft className="h-4 w-4 text-gray-400" /></div>
                <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:bg-white" />
            </div>
          </div>

          {/* 📁 SECCIÓN DE CARGA DE ARCHIVO */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Comprobante (Imagen o PDF)</label>
            <div className="relative group">
              <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                accept="image/*,.pdf" 
                className="hidden"
              />
              <label 
                htmlFor="file-upload" 
                className={`flex items-center justify-between w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  previewName ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 hover:border-indigo-400 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${previewName ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {archivo?.type === 'application/pdf' ? <FileText size={16}/> : <Paperclip size={16}/>}
                  </div>
                  <span className="text-xs font-semibold truncate max-w-[200px]">
                    {previewName || "Subir boleta o recibo..."}
                  </span>
                </div>
                <Upload size={16} className={previewName ? 'text-indigo-500' : 'text-gray-400'} />
              </label>
            </div>
          </div>

          {!transactionToEdit && (
            <div className="flex items-center gap-2.5 px-1 py-1 mt-2">
              <input type="checkbox" id="mantenerAbierto" checked={mantenerAbierto} onChange={(e) => setMantenerAbierto(e.target.checked)} className="w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-indigo-500 transition-all cursor-pointer" />
              <label htmlFor="mantenerAbierto" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">Mantener ventana abierta</label>
            </div>
          )}

          <div className="pt-5 flex gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button type="submit" className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95 ${formData.tipo === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
              {transactionToEdit ? 'Actualizar' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevaTransaccion;