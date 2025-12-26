import { Link } from 'react-router-dom';
import logo from '../assets/logo-conadmin.png';

function LandingPage() {
  
  // Función para scroll suave a las características
  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-indigo-100">
      
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
            <img className="h-12 w-auto animate-trompo" src={logo} alt="logo-ConAdmin" />
            <span className="font-bold text-xl tracking-tight text-slate-800">
              CON<span className="text-[oklch(50%_0.134_242.749)]">ADMIN</span>
            </span>
        </div>

        {/* Botón de Acción Principal */}
        <div>
           <Link 
             to="/login" 
             className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20"
            >
             Ingresar al Sistema
           </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="px-6 pt-16 pb-24 text-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl -z-10 opacity-50"></div>

        <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Etiqueta de Proyecto Académico */}
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-semibold mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Proyecto de Titulación - IACC 2025
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-8 tracking-tight">
                Gestión inteligente para <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(50%_0.134_242.749)] to-purple-600">
                    Comunidades
                </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Una solución Fullstack diseñada para optimizar la administración de condominios, 
                eliminando la dependencia de hojas de cálculo y centralizando la información.
            </p>
            
            {/* Botones Hero */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                {/* Botón Principal Hero (Llamado a la acción del sistema) */}
                <Link to="/login" className="px-8 py-4 bg-[oklch(50%_0.134_242.749)] hover:bg-[oklch(45%_0.134_242.749)] text-white text-lg font-bold rounded-xl shadow-xl shadow-indigo-200 transition-all">
                    Probar Prototipo
                </Link>
                
                {/* Botón Secundario (Informativo) */}
                <button 
                  onClick={scrollToFeatures}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-slate-700 border border-slate-200 text-lg font-bold rounded-xl shadow-sm transition-all"
                >
                    Ver Funcionalidades
                </button>
            </div>
        </div>
      </header>

      {/* 3. TECH STACK (Nuevo: Ideal para tesis/portafolio) */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">Desarrollado con tecnologías modernas</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Puedes reemplazar estos textos con iconos SVG reales si los tienes */}
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">⚛️ React</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">⚡ Vite</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🎨 Tailwind CSS</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🐬 MySQL</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🐍 Python</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🧪 Flask</span>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Arquitectura del Sistema</h2>
            <p className="text-slate-500 mt-4">Módulos principales desarrollados para el MVP</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    👥
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Gestión de Residentes</h3>
                <p className="text-slate-500 leading-relaxed">CRUD completo para propietarios y arrendatarios. Vinculación de datos relacionales por unidad habitacional.</p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    📊
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Control Financiero</h3>
                <p className="text-slate-500 leading-relaxed">Registro de ingresos y egresos. Cálculo automatizado de estados de pago y visualización de morosidad.</p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                    📢
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Módulo de Comunicaciones</h3>
                <p className="text-slate-500 leading-relaxed">Sistema de anuncios en tiempo real para mantener informada a la comunidad desde el panel administrativo.</p>
            </div>
        </div>
      </section>

      {/* 5. FOOTER ACADÉMICO */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-white font-bold text-lg mb-1">ConAdmin v1.0</p>
                <p className="text-sm">Desarrollado por [Tu Nombre]</p>
            </div>
            
            <div className="text-sm text-center md:text-right">
                <p>Proyecto para optar al título de:</p>
                <p className="text-indigo-400 font-medium">Técnico en Análisis y Programación Computacional</p>
                <p className="mt-2 text-xs opacity-50">IACC - 2025</p>
            </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage