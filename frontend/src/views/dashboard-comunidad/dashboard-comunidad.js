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
    if (listaAnunciosUL) {
        const anuncios = getAnuncios(comunidadId);
        
        // 1. Actualizar el contador de anuncios
        if (totalAnunciosStat) {
            totalAnunciosStat.textContent = anuncios.length;
        }

        // 2. Renderizar la lista
        listaAnunciosUL.innerHTML = ""; // Limpiar contenido previo (cargando...)

        if (anuncios.length === 0) {
            listaAnunciosUL.innerHTML = "<li class=\"text-gray-500 text-sm italic\">No hay anuncios publicados.</li>";
        } else {
            // Mostrar los últimos 5 anuncios
            anuncios.slice(0, 5).forEach(anuncio => {
                // Definir color del borde según prioridad
                let borderClass = "border-l-4 border-gray-300"; // Normal
                if (anuncio.prioridad === "alta") borderClass = "border-l-4 border-red-500";
                if (anuncio.prioridad === "baja") borderClass = "border-l-4 border-blue-300";

                const li = document.createElement("li");
                li.className = `bg-gray-50 p-3 rounded shadow-sm ${borderClass}`;
                li.innerHTML = `
                    <div class="flex justify-between items-start">
                        <p class="font-medium text-gray-800">${anuncio.titulo}</p>
                        <span class="text-xs text-gray-400">${anuncio.fecha}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">${anuncio.mensaje}</p>
                `;
                listaAnunciosUL.appendChild(li);
            });
        }
    }
});
    
