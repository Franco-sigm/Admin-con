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

// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    // --- 3. REFERENCIAS AL DOM ---
    const tituloDashboard = document.getElementById("comunidad-nombre-titulo");
    
    // Referencias de Links del Sidebar
    const linkDashboard = document.getElementById("link-dashboard");
    const linkResidentes = document.getElementById("link-residentes");
    const linkPagosGastos = document.getElementById("link-pagos-gastos");
    const enviarAnuncioLink = document.getElementById("enviar-anuncio-link");
    
    // Referencia de Stats
    const totalResidentesStat = document.getElementById("total-residentes-stat");
    
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
    if (enviarAnuncioLink) enviarAnuncioLink.href = `../nuevo-anuncio/nuevo-anuncio.html${comunidadHref}`;

    // 2. Limpiar y Activar Color
    limpiarClasesActivas(linkResidentes);
    limpiarClasesActivas(linkPagosGastos);
    // Limpiamos el dashboard también por seguridad
    limpiarClasesActivas(linkDashboard);
    
    // 3. ACTIVAR SOLO EL DASHBOARD (Página actual)
    activarLink(linkDashboard);


    // C. Cargar Datos del Dashboard (Stats)
    if (totalResidentesStat) {
        const residentes = getResidentesPorComunidad(comunidadId);
        const totalResidentes = residentes.length;
        totalResidentesStat.textContent = totalResidentes;
    }
});