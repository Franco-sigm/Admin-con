// ¡NUEVO! - PASO 1: Función auxiliar
// Esta función va AFUERA del 'DOMContentLoaded' para que esté disponible.
/**
 * Obtiene los residentes SÓLO de una comunidad específica
 * @param {number} comunidadId - El ID de la comunidad
 * @returns {Array} Un array de residentes
 */
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

    // ---
    // 2. VINCULACIÓN (Datos): Funciones de Base de Datos (Copiadas)
    // ---
    // (Necesarias para leer el nombre de la comunidad)
    const DB_KEY = 'mis_comunidades';

    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    };

    // ---
    // 3. REFERENCIAS A ELEMENTOS DEL DOM
    // ---
    const tituloDashboard = document.getElementById('comunidad-nombre-titulo');
    const linkResidentes = document.getElementById('link-residentes');
    //const linkDashboard = document.getElementById('link-dashboard');
    const totalResidentesStat = document.getElementById('total-residentes-stat');
   


    // ---
    // 4. LÓGICA PRINCIPAL: Leer ID y actualizar título
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
    // 5. ¡ÉXITO! Actualizamos el título
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