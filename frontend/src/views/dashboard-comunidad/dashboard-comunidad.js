// --- LÓGICA DEL SIDEBAR (PARTE 1: INMEDIATA) ---
// (Va AFUERA del DOMContentLoaded para evitar el parpadeo)

const SIDEBAR_STATE_KEY = 'sidebar_state';

/**
 * Función que aplica el estado (abierto/cerrado) a la UI.
 */
const aplicarEstadoSidebar = (estado) => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarTexts = document.querySelectorAll('.sidebar-text');
    const sidebarSubtitle = document.getElementById('sidebar-subtitle');

    if (!sidebar) return; 

    if (estado === 'cerrado') {
        // --- CERRAR --- (Esta parte ya estaba bien)
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-20');
        mainContent.classList.remove('md:ml-64');
        mainContent.classList.add('md:ml-20');

        sidebarTexts.forEach(text => text.classList.add('opacity-0'));
        if (sidebarSubtitle) sidebarSubtitle.classList.add('opacity-0');

        setTimeout(() => {
            sidebarTexts.forEach(text => text.classList.add('hidden'));
            if (sidebarSubtitle) sidebarSubtitle.classList.add('hidden');
        }, 200); // Coincide con tu duration-200
        
    } else {
        // --- ABRIR --- (AQUÍ ESTÁ EL CAMBIO)
        sidebar.classList.remove('w-20');
        sidebar.classList.add('w-64');
        mainContent.classList.remove('md:ml-20');
        mainContent.classList.add('md:ml-64');

        // 1. Quita 'hidden' PRIMERO.
        sidebarTexts.forEach(text => text.classList.remove('hidden'));
        if (sidebarSubtitle) sidebarSubtitle.classList.remove('hidden');

        // 2. USA UN 'setTimeout' CON UN RETRASO MÍNIMO
        // Esto le da al navegador un "tick" completo para aplicar
        // el 'display: block' (de quitar 'hidden') ANTES
        // de que intente animar la opacidad.
        setTimeout(() => {
            sidebarTexts.forEach(text => text.classList.remove('opacity-0'));
            if (sidebarSubtitle) sidebarSubtitle.classList.remove('opacity-0');
        }, 10); // 10ms es imperceptible para el usuario pero un mundo para el navegador
    }
};
// --- Aplicamos el estado guardado INMEDIATAMENTE ---
const estadoInicial = localStorage.getItem(SIDEBAR_STATE_KEY) || 'abierto';
aplicarEstadoSidebar(estadoInicial);

// --- FIN LÓGICA SIDEBAR (PARTE 1) ---


// --- TU FUNCIÓN AUXILIAR (EXISTENTE) ---
// (También va AFUERA del DOMContentLoaded)
const getResidentesPorComunidad = (comunidadId) => {
    // Usamos la misma "llave" que definimos en residentes.js
    const DB_KEY_RESIDENTES = `residentes_${comunidadId}`;
    const data = localStorage.getItem(DB_KEY_RESIDENTES);
    if (!data) {
        return [];
    }
    return JSON.parse(data);
};

// 1. Esperar a que el HTML (DOM) esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL SIDEBAR (PARTE 2: LISTENER DEL BOTÓN) ---
    // (Va ADENTRO del DOMContentLoaded, al principio)
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            // 1. Revisa el estado actual
            const estadoActual = localStorage.getItem(SIDEBAR_STATE_KEY) || 'abierto';
            // 2. Define el nuevo estado
            const nuevoEstado = (estadoActual === 'abierto') ? 'cerrado' : 'abierto';
            // 3. Aplica el cambio a la UI
            aplicarEstadoSidebar(nuevoEstado);
            // 4. Guarda el nuevo estado
            localStorage.setItem(SIDEBAR_STATE_KEY, nuevoEstado);
        });
    }
    // --- FIN LÓGICA SIDEBAR (PARTE 2) ---


    // ---
    // 2. VINCULACIÓN (Datos): Funciones de Base de Datos (TU CÓDIGO)
    // ---
    const DB_KEY = 'mis_comunidades';

    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    };

    // ---
    // 3. REFERENCIAS A ELEMENTOS DEL DOM (TU CÓDIGO)
    // ---
    const tituloDashboard = document.getElementById('comunidad-nombre-titulo');
    const linkResidentes = document.getElementById('link-residentes');
    //const linkDashboard = document.getElementById('link-dashboard');
    const totalResidentesStat = document.getElementById('total-residentes-stat');
    
    // ---
    // 4. LÓGICA PRINCIPAL: Leer ID y actualizar título (TU CÓDIGO)
    // ---
    
    // Leemos el ID de la URL (ej: ?id=12345)
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get('id'));

    // Si no hay ID, mostramos un error en el título
    if (!comunidadId) {
        tituloDashboard.textContent = 'Error: Comunidad no encontrada';
        return; 
    }

    // Buscamos la comunidad en nuestra "base de datos"
    const comunidades = getComunidades();
    const comunidadActual = comunidades.find(com => com.id === comunidadId);

    // Si el ID existe pero no encontramos la comunidad
    if (!comunidadActual) {
        tituloDashboard.textContent = 'Error: Comunidad no encontrada';
        return;
    }

    // ---
    // 5. ¡ÉXITO! Actualizamos el título (TU CÓDIGO)
    // ---
    // Usamos textContent para insertar el nombre de forma segura
    tituloDashboard.textContent = `Dashboard: ${comunidadActual.nombre}`;
    linkResidentes.href = `../residentes/residentes.html?id=${comunidadActual.id}`; 
    // linkDashboard.href = "#"; // Página actual

    if (totalResidentesStat) {
        // 1. Buscamos los residentes de ESTA comunidad
        const residentes = getResidentesPorComunidad(comunidadId);
        
        // 2. Contamos cuántos hay
        const totalResidentes = residentes.length;
        
        // 3. Actualizamos el número en el HTML
        totalResidentesStat.textContent = totalResidentes;
    }
});