import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Building2, Calculator, Percent, ShieldCheck, RefreshCw, AlertTriangle, Zap} from 'lucide-react';
import api from '../api/client';

// Componente auxiliar para renderizar los labels e inputs de forma uniforme
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
    {children}
  </div>
);

const ConfiguracionComunidad = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [superficieMasiva, setSuperficieMasiva] = useState("");
  const [comunidad, setComunidad] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    superficie_total_m2: 0,
    fondo_reserva_porcentaje: 0
  });

  // Extraemos la lógica de carga para poder re-usarla
  const cargarDatos = async () => {
    try {
      const response = await api.get(`/api/comunidades/${id}`);
      setComunidad(response.data);
    } catch (error) {
      console.error("Error al cargar configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const handleSave = async () => {
  setGuardando(true);
  try {
        // Enviamos el objeto comunidad que ya tiene superficie_total_m2 y fondo_reserva_porcentaje
        await api.put(`/api/comunidades/${id}`, comunidad);
        
        // Nota: Si ya limpiaste la ruta duplicada en propiedades.py como conversamos,
        // deberías borrar la siguiente línea para evitar un error 404/405
        // await api.put(`/api/propiedades/comunidad/${id}`, comunidad); 
        
        alert("¡Configuración guardada!");
    } catch (error) {
        alert("Error al guardar: " + error.response?.data?.detail);
    } finally {
        setGuardando(false);
  }
};

  // --- FUNCIÓN PARA APLICAR SUPERFICIE MASIVA ---
  const aplicarSuperficieMasiva = async () => {
    if (!superficieMasiva || superficieMasiva <= 0) return alert("Ingresa un valor válido");
    
    if (!window.confirm(`¿Seguro? Todas las unidades pasarán a tener ${superficieMasiva} m².`)) return;
  
    try {
      await api.post(`/api/propiedades/comunidad/${id}/superficie-masiva?superficie=${superficieMasiva}`);
      alert("Superficies actualizadas. ¡No olvides recalcular los prorrateos ahora!");
      setSuperficieMasiva(""); // Limpiar campo
    } catch (error) {
      alert("Error al aplicar superficie masiva");
    }
  };
  
  // --- FUNCIÓN PARA RECALCULAR PRORRATEOS ---
  const recalcularProrrateos = async () => {
    if (!window.confirm("¿Estás seguro? Esto sobrescribirá el prorrateo de todas las unidades basado en sus m2 actuales.")) return;
    try {
      await api.post(`/api/propiedades/comunidad/${id}/recalcular-prorrateos`);
      alert("Prorrateos actualizados exitosamente.");
      // Recargamos los datos para ver la nueva superficie total calculada por el backend
      cargarDatos(); 
    } catch (error) {
      alert("Error al recalcular.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-indigo-600" />
            Configuración de la Comunidad
          </h1>
          <p className="text-gray-500 text-sm">Parámetros globales y reglas de cálculo del edificio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={guardando}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95"
        >
          {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Configuración
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA PRINCIPAL (IZQUIERDA) --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN: IDENTIFICACIÓN LEGAL */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Información Legal y Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nombre de la Comunidad">
                <input 
                  type="text"
                  value={comunidad.nombre}
                  onChange={(e) => setComunidad({...comunidad, nombre: e.target.value})}
                  className="w-full bg-gray-50 border-transparent rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </Field>
              <Field label="RUT de la Comunidad">
                <input 
                  type="text"
                  placeholder="76.123.456-K"
                  value={comunidad.rut || ''}
                  onChange={(e) => setComunidad({...comunidad, rut: e.target.value})}
                  className="w-full bg-gray-50 border-transparent rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Dirección Completa">
                  <input 
                    type="text"
                    value={comunidad.direccion || ''}
                    onChange={(e) => setComunidad({...comunidad, direccion: e.target.value})}
                    className="w-full bg-gray-50 border-transparent rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* SECCIÓN: PRORRATEO Y SUPERFICIE */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-emerald-500" />
              Gestión de Prorrateo Global
            </h2>
            
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-emerald-600 mt-1 shrink-0" />
              <p className="text-sm text-emerald-800 leading-relaxed">
                La superficie total es la suma de todas las unidades. Use <strong>Recalcular</strong> después de cualquier cambio masivo para asegurar la integridad de los gastos comunes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <Field label="Superficie Total Registrada">
                <div className="relative">
                  <input 
                    type="number"
                    value={comunidad.superficie_total_m2 || 0}
                    readOnly
                    className="w-full bg-gray-100 text-gray-500 border-none rounded-2xl px-4 py-3 pr-12 font-mono text-xl cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">m²</span>
                </div>
              </Field>
              <button 
                onClick={recalcularProrrateos}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Sincronizar Prorrateos
              </button>
            </div>
          </section>
        </div>

        {/* --- COLUMNA LATERAL (DERECHA) --- */}
        <aside className="space-y-6">
          
          {/* CARD: ASIGNACIÓN MASIVA */}
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 space-y-4 shadow-sm">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Asignación Masiva
            </h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              ¿Unidades idénticas? Define la superficie base para todas en un solo paso.
            </p>
            <div className="flex flex-col gap-3">
              <input 
                type="number" 
                placeholder="Ej: 55.40"
                value={superficieMasiva}
                onChange={(e) => setSuperficieMasiva(e.target.value)}
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-center"
              />
              <button 
                onClick={aplicarSuperficieMasiva}
                className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-sm"
              >
                Aplicar a Todas
              </button>
            </div>
          </div>

          {/* CARD: FINANZAS */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <Percent className="w-5 h-5" />
              Parámetros Financieros
            </h3>
            <Field label="Fondo de Reserva (%)">
              <input 
                type="number"
                value={comunidad.fondo_reserva_porcentaje}
                onChange={(e) => setComunidad({...comunidad, fondo_reserva_porcentaje: parseFloat(e.target.value)})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-white outline-none font-bold text-lg"
              />
            </Field>
            <div className="p-3 bg-indigo-700/50 rounded-xl">
              <p className="text-[11px] opacity-80 leading-snug italic">
                * Este cargo se añade al neto del Gasto Común para el fondo de ahorro del edificio.
              </p>
            </div>
          </div>

          {/* DROPZONE PLACEHOLDER */}
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-3 group hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
              <Building2 className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo Institucional</p>
          </div>
          
        </aside>
      </div>
    </div>
  );
};

export default ConfiguracionComunidad;