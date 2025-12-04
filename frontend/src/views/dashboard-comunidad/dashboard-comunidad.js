// src/views/dashboard-comunidad/dashboard-comunidad.js

// --- 1. FUNCIONES UNIVERSALES (Van AFUERA) ---

// Clases para el estado ACTIVO (Azul) y PASIVO (Gris)
const ACTIVE_CLASSES = ["text-blue-600", "bg-blue-50", "border-r-4", "border-blue-600", "font-semibold"];
const PASSIVE_CLASSES = ["text-gray-700", "hover:bg-gray-100"];

const limpiarClasesActivas = (linkElement) => {
    if (linkElement) {
        linkElement.classList.remove(...ACTIVE_CLASSES);
        linkElement.classList.add(...PASSIVE_CLASSES);
    }
};

const activarLink = (linkElement) => {
    if (linkElement) {
        linkElement.classList.remove(...PASSIVE_CLASSES);
        linkElement.classList.add(...ACTIVE_CLASSES);
    }
};

// --- 2. FUNCIONES AUXILIARES DE DATOS ---

const getResidentesPorComunidad = (comunidadId) => {
    const DB_KEY_RESIDENTES = `residentes_${comunidadId}`;
    const data = localStorage.getItem(DB_KEY_RESIDENTES);
    if (!data) return [];
    return JSON.parse(data);
};
// [NUEVO] Función para obtener anuncios
const getAnuncios = (id) => {
    const key = `anuncios_${id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};
// [NUEVO] Función necesaria para guardar los cambios al borrar
const saveAnuncios = (comunidadId, anuncios) => {
    const key = `anuncios_${comunidadId}`;
    localStorage.setItem(key, JSON.stringify(anuncios));
};

// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // --- 3. REFERENCIAS AL DOM ---
    const tituloDashboard = document.getElementById("comunidad-nombre-titulo");
    
    // Referencias de Links del Sidebar
    const linkDashboard = document.getElementById("link-dashboard");
    const linkResidentes = document.getElementById("link-residentes");
    const linkPagosGastos = document.getElementById("link-pagos-gastos");
    const creArAnuncio = document.getElementById("btn-ir-a-crear-anuncio");
    const listaAnunciosUL = document.getElementById("lista-anuncios");
    const btnEnviarAnuncio = document.getElementById("btn-enviar-anuncio");
    
    // Referencia de Stats
    const totalResidentesStat = document.getElementById("total-residentes-stat");
    const totalAnunciosStat = document.getElementById("total-anuncios-stat");
    
    // --- 4. VALIDACIÓN DE COMUNIDAD ---
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("id"));

    // DB de Comunidades (Local)
    const getComunidades = () => {
        const data = localStorage.getItem("mis_comunidades");
        return data ? JSON.parse(data) : [];
    };

    if (!comunidadId) {
        tituloDashboard.textContent = "Error: Comunidad no encontrada";
        return; 
    }

    const comunidades = getComunidades();
    const comunidadActual = comunidades.find(com => com.id === comunidadId);

    if (!comunidadActual) {
        tituloDashboard.textContent = "Error: Comunidad no encontrada";
        return;
    }

    // --- 5. LÓGICA PRINCIPAL ---

    // A. Actualizar Título
    tituloDashboard.textContent = `Dashboard: ${comunidadActual.nombre}`;
    
    // B. Actualizar Links y Navegación (El bloque universal)
    const comunidadHref = `?id=${comunidadActual.id}`;
    
    // 1. Setear HREFs dinámicos (para poder navegar a otras secciones)
    if (linkDashboard) linkDashboard.href = `../dashboard-comunidad/dashboard-comunidad.html${comunidadHref}`;
    if (linkResidentes) linkResidentes.href = `../residentes/residentes.html${comunidadHref}`;
    if (linkPagosGastos) linkPagosGastos.href = `../pagos-gastos/pagos-gastos.html${comunidadHref}`;
    if (creArAnuncio) creArAnuncio.href = `../nuevo-anuncio/nuevo-anuncio.html${comunidadHref}`;

    // 2. Limpiar y Activar Color
    limpiarClasesActivas(linkResidentes);
    limpiarClasesActivas(linkPagosGastos);
    // Limpiamos el dashboard también por seguridad
    limpiarClasesActivas(linkDashboard);
    
    // 3. ACTIVAR SOLO EL DASHBOARD (Página actual)
    activarLink(linkDashboard);

    if (btnEnviarAnuncio) {
        // Si es un <a> usamos href, si es <button> usamos evento click (opcional)
        
        btnEnviarAnuncio.addEventListener("click", (e) => {
             e.preventDefault(); // Por si acaso es un link con #
             window.location.href = `../nuevo-anuncio/nuevo-anuncio.html${comunidadHref}`;
        });
    }


    // C. Cargar Datos del Dashboard (Stats)
    if (totalResidentesStat) {
        const residentes = getResidentesPorComunidad(comunidadId);
        const totalResidentes = residentes.length;
        totalResidentesStat.textContent = totalResidentes;
    }
    // --- D. CARGAR DATOS (ANUNCIOS) [NUEVO] ---
   // 1. Definimos la función de renderizado para poder re-usarla
    const renderizarAnuncios = () => {
        if (!listaAnunciosUL) return;

        const anuncios = getAnuncios(comunidadId);
        
        // Actualizar contador
        if (totalAnunciosStat) {
            totalAnunciosStat.textContent = anuncios.length;
        }

        // Limpiar lista visual
        listaAnunciosUL.innerHTML = ""; 

        if (anuncios.length === 0) {
            listaAnunciosUL.innerHTML = "<li class=\"text-gray-500 text-sm italic\">No hay anuncios publicados.</li>";
        } else {
            // Mostrar últimos 5 anuncios
            anuncios.slice(0, 5).forEach(anuncio => {
                let borderClass = "border-l-4 border-gray-300"; 
                if (anuncio.prioridad === "alta") borderClass = "border-l-4 border-red-500";
                if (anuncio.prioridad === "baja") borderClass = "border-l-4 border-blue-300";

                const li = document.createElement("li");
                li.className = `bg-gray-50 p-3 rounded shadow-sm ${borderClass} flex justify-between items-start group`;
                
                // HTML INTERNO: Incluye el botón de borrar con icono SVG
                li.innerHTML = `
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <p class="font-medium text-gray-800">${anuncio.titulo}</p>
                            <span class="text-xs text-gray-400 ml-2">${anuncio.fecha}</span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1 line-clamp-2">${anuncio.mensaje}</p>
                    </div>
                    
                    <button class="btn-eliminar-anuncio ml-3 text-gray-400 hover:text-red-500 transition-colors" data-id="${anuncio.id}" title="Eliminar anuncio">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                listaAnunciosUL.appendChild(li);
            });
        }
    };

    // 2. Ejecutar renderizado inicial
    renderizarAnuncios();

    // 3. Listener para borrar (Delegación de Eventos)
    if (listaAnunciosUL) {
        listaAnunciosUL.addEventListener("click", (e) => {
            // Buscamos si el clic fue en un botón de eliminar (o en el ícono dentro)
            const btn = e.target.closest(".btn-eliminar-anuncio");
            
            if (btn) {
                const idAnuncio = Number(btn.dataset.id);
                
                if (confirm("¿Estás seguro de eliminar este anuncio?")) {
                    // a. Obtener lista actual
                    const anuncios = getAnuncios(comunidadId);
                    // b. Filtrar (quitar el que tenga ese ID)
                    const nuevosAnuncios = anuncios.filter(a => a.id !== idAnuncio);
                    // c. Guardar nueva lista
                    saveAnuncios(comunidadId, nuevosAnuncios);
                    // d. Refrescar la pantalla
                    renderizarAnuncios();
                }
            }
        });
    }
});
    
