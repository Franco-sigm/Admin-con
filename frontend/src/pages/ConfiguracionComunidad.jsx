import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Building2, Calculator, Percent, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../api/client';

const ConfiguracionComunidad = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [comunidad, setComunidad] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    superficie_total_m2: 0,
    fondo_reserva_porcentaje: 0
  });

  useEffect(() => {
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
    cargarDatos();
  }, [id]);

  const handleSave = async () => {
    setGuardando(true);
    try {
      await api.put(`/api/comunidades/${id}`, comunidad);
      alert("Configuración actualizada correctamente");
    } catch (error) {
      alert("Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  const recalcularProrrateos = async () => {
    if (!window.confirm("¿Estás seguro? Esto sobrescribirá el prorrateo de todas las unidades basado en sus m2 actuales.")) return;
    try {
      await api.post(`/api/propiedades/comunidad/${id}/recalcular-prorrateos`);
      alert("Prorrateos actualizados exitosamente.");
    } catch (error) {
      alert("Error al recalcular.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-indigo-600" />
            Configuración de la Comunidad
          </h1>
          <p className="text-gray-500 text-sm">Gestiona los parámetros globales y reglas de cálculo del edificio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={guardando}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {guardando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información Legal */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Información Legal y Ubicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombre de la Comunidad</label>
                <input 
                  type="text"
                  value={comunidad.nombre}
                  onChange={(e) => setComunidad({...comunidad, nombre: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">RUT de la Comunidad</label>
                <input 
                  type="text"
                  placeholder="76.123.456-K"
                  value={comunidad.rut || ''}
                  onChange={(e) => setComunidad({...comunidad, rut: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Dirección Completa</label>
                <input 
                  type="text"
                  value={comunidad.direccion || ''}
                  onChange={(e) => setComunidad({...comunidad, direccion: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Sección Calculadora de Prorrateo */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-500" />
                Asistente de Prorrateo Global
              </h2>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                Define la <strong>Superficie Total Municipal</strong> del edificio. Este valor será el divisor común para calcular el porcentaje de copropiedad de cada unidad automáticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Superficie Total (m²)</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    value={comunidad.superficie_total_m2}
                    onChange={(e) => setComunidad({...comunidad, superficie_total_m2: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-emerald-500 font-mono text-lg"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">m²</span>
                </div>
              </div>
              
              <button 
                onClick={recalcularProrrateos}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
              >
                <RefreshCw className="w-4 h-4" />
                Recalcular Unidades
              </button>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Parámetros Financieros */}
        <div className="space-y-6">
          <section className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Finanzas
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-70">Fondo de Reserva (%)</label>
                <input 
                  type="number"
                  value={comunidad.fondo_reserva_porcentaje}
                  onChange={(e) => setComunidad({...comunidad, fondo_reserva_porcentaje: parseFloat(e.target.value)})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-white outline-none"
                />
              </div>
              <p className="text-[10px] opacity-60 leading-tight italic">
                * Este porcentaje se sumará automáticamente al gasto común neto para crear el fondo de ahorro del edificio.
              </p>
            </div>
          </section>

          <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center text-gray-400">
              Logo
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Próximamente: Cargar Logo</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfiguracionComunidad;