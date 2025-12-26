import { Link } from 'react-router-dom'
import logo from '../assets/logo-conadmin.png';

function LandingPage() {

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900">
      
    {/* 1. NAVBAR (Barra superior) */}
      <nav className="flex justify-between items-center px-8 py-4 bg-transparent  sticky top-0 z-50">
        
        <div className="flex items-center group">
            
              <img className="h-16 w-auto animate-trompo" src={logo} alt="logo-ConAdmin" />
              <span className="font-bold text-xl hidden sm:block -ml-8 -mt-2">
                <span className="text-[oklch(50%_0.134_242.749)]">CONADMIN</span>
              </span>
            
        </div>
                       

        {/* DERECHA: Botones de Acción ( incluir esto antes de cerrar </nav>) */}
       <div className="space-x-4">
            {/* Botón para entrar al sistema */}
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-[oklch(50%_0.134_242.749)] hover:bg-[oklch(45%_0.134_242.749)] text-white font-medium rounded-lg transition shadow-lg"
             >
              Ingresar al Sistema
           </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION (La portada principal) */}
      <header className="px-6 py-20 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
                Proyecto de mejora para practica profesional IACC 2025
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                La forma moderna de administrar <span className="text-[oklch(50%_0.134_242.749)]">tu comunidad</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Olvídate de las planillas de Excel. Gestiona residentes, gastos comunes y anuncios en una sola plataforma rápida y segura.
            </p>

            <Link to="/login" className="px-8 py-4 bg-[oklch(50%_0.134_242.749)] hover:bg-[oklch(45%_0.134_242.749)] text-white text-lg font-bold rounded-xl shadow-xl shadow-indigo-200 transition-all">
                    Probar Prototipo
            </Link>
            
        </div>
      </header>

      {/* 3. FEATURES (Características) */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Todo lo que necesitas en un solo lugar</h2>
        
        <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4">☖</div>
                <h3 className="text-xl font-bold mb-3">Residentes</h3>
                <p className="text-gray-500">Mantén un padrón actualizado de propietarios y arrendatarios con sus datos de contacto al día.</p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">∑</div>
                <h3 className="text-xl font-bold mb-3">Finanzas Claras</h3>
                <p className="text-gray-500">Registra ingresos y egresos. Identifica rápidamente quién está al día y quién está moroso.</p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4">▤</div>
                <h3 className="text-xl font-bold mb-3">Comunicación</h3>
                <p className="text-gray-500">Publica anuncios importantes para que toda la comunidad esté informada al instante.</p>
            </div>
        </div>
      </section>
      
      <section className="py-10 border-y border-slate-200 bg-white">
        <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6"> tecnologías implementadas</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            
            {/* Frontend */}
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">⚛️ React</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">⚡ Vite</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🎨 Tailwind</span>
            
            {/* Backend & DB */}
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🐍 Python</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🧪 Flask</span> 
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2">🐬 MySQL</span>
            
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-white font-bold text-lg mb-1">ConAdmin v1.0</p>
                <p className="text-sm">Desarrollado por [Franco Fernando Cañete Herrera]</p>
            </div>
            
            <div className="text-sm text-center md:text-right">
                <p>Proyecto para optar al título de:</p>
                <p className="text-indigo-400 font-medium">Técnico en Análisis y Programación Computacional</p>
                <p className="mt-2 text-xs opacity-50">IACC - 2025-2026</p>
            </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage