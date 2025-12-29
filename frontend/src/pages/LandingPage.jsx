import { Link } from 'react-router-dom'
import logo from '../assets/logo-conadmin.png';

function LandingPage() {

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      
      {/* 1. NAVBAR */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        
        <div className="flex items-center gap-3">
             <img className="h-12 w-auto animate-trompo" src={logo} alt="logo-ConAdmin" />
             <span className="font-bold text-xl hidden sm:block tracking-tight -ml-8 -mt-2">
                CON<span className="text-[oklch(50%_0.134_242.749)]">ADMIN</span>
             </span>
        </div>

        {/* Botones de Acción Navbar */}
        <div className="space-x-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition shadow-lg"
             >
              Ingresar al Sistema
            </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="px-6 py-20 text-center bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6 border border-indigo-200">
                Proyecto de mejora para práctica profesional IACC 2025
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                La forma moderna de administrar <span className="text-[oklch(50%_0.134_242.749)]">tu comunidad</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Olvídate de las planillas de Excel. Gestiona residentes, gastos comunes y anuncios en una sola plataforma rápida y segura.
            </p>

            {/* CONTENEDOR DE BOTONES HERO */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                {/* Botón 1: Probar Prototipo */}
                <Link 
                    to="/login" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-[oklch(50%_0.134_242.749)] hover:bg-[oklch(45%_0.134_242.749)] text-white text-lg font-bold rounded-xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1"
                >
                    Probar Prototipo
                </Link>
                
                {/* Botón 2: GitHub Repo */}
                <a 
                    href="https://github.com/Franco-sigm/Admin-con/tree/version-flask"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-xl shadow-xl transition-all transform hover:-translate-y-1"
                >
                    {/* Ícono SVG de GitHub */}
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    Ver Código
                </a>
            </div>
            
        </div>
      </header>

      {/* 3. FEATURES */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 text-slate-800">Todo lo que necesitas en un solo lugar</h2>
        
        <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-2xl mb-4">☖</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Residentes</h3>
                <p className="text-gray-500">Mantén un padrón actualizado de propietarios y arrendatarios con sus datos de contacto al día.</p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl mb-4">∑</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Finanzas Claras</h3>
                <p className="text-gray-500">Registra ingresos y egresos. Identifica rápidamente quién está al día y quién está moroso.</p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition duration-300">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-2xl mb-4">▤</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Comunicación</h3>
                <p className="text-gray-500">Publica anuncios importantes para que toda la comunidad esté informada al instante.</p>
            </div>
        </div>
      </section>
      
      {/* 4. TECH STACK */}
      <section className="py-12 border-y border-slate-200 bg-slate-50">
        <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-8">Tecnologías implementadas</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            
            {/* Frontend */}
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-[#61DAFB] transition-colors">⚛️ React</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-[#646CFF] transition-colors">⚡ Vite</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-[#06B6D4] transition-colors">🎨 Tailwind</span>
            
            {/* Backend & DB */}
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-[#3776AB] transition-colors">🐍 Python</span>
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-slate-800 transition-colors">🧪 Flask</span> 
            <span className="text-xl font-bold text-slate-600 flex items-center gap-2 hover:text-[#4479A1] transition-colors">🐬 MySQL</span>
            
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <p className="text-white font-bold text-lg mb-1">MVP</p>
                <p className="text-sm">Desarrollado por <span className="text-white">Franco Fernando Cañete Herrera</span></p>
            </div>
            
            <div className="text-sm text-center md:text-right">
                <p>Proyecto para optar al título de:</p>
                <p className="text-indigo-400 font-medium">Técnico de nivel superior en Análisis y Programación Computacional</p>
                <p className="mt-2 text-xs opacity-50">IACC - 2025-2026</p>
            </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage