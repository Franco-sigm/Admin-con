// src/views/pagos-gastos/pagos-gastos.js

// --- FUNCIONES UNIVERSALES DE ACTIVACIÓN (Van AFUERA) ---
// Estas funciones se usarán en todos los módulos (Dashboard, Residentes, etc.)

const ACTIVE_CLASSES = ['text-blue-600', 'bg-blue-50', 'border-r-4', 'border-blue-600', 'font-semibold'];
const PASSIVE_CLASSES = ['text-gray-700', 'hover:bg-gray-100'];

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
// --- FIN FUNCIONES UNIVERSALES ---


document.addEventListener('DOMContentLoaded', () => {

    // 1. REFERENCIAS AL DOM
    const tituloSeccion = document.getElementById('comunidad-nombre-titulo');
    const linkDashboard = document.getElementById('link-dashboard');
    const linkResidentes = document.getElementById('link-residentes'); 
    const linkPagosGastos = document.getElementById('link-pagos-gastos'); 
    
    // [Tus otras referencias de Finanzas como btnNuevaTransaccion, etc.]
    const btnNuevaTransaccion = document.getElementById('btn-nueva-transaccion');


    // 2. OBTENER ID y VALIDAR
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get('id'));

    if (!comunidadId) {
        tituloSeccion.textContent = 'Error: Comunidad no definida.';
        window.location.replace('../selector-comunidad/selector-comunidad.html'); 
        return;
    }
    
    // 3. SETEAR ENLACES DINÁMICOS Y ACTIVAR
    
    // A. Aplicar HREFs Dinámicos
    const comunidadHref = `?id=${comunidadId}`;

    if (linkDashboard) linkDashboard.href = `../dashboard-comunidad/dashboard-comunidad.html${comunidadHref}`;
    if (linkResidentes) linkResidentes.href = `../residentes/residentes.html${comunidadHref}`;
    if (linkPagosGastos) linkPagosGastos.href = `../pagos-gastos/pagos-gastos.html${comunidadHref}`;
    
    // B. Limpiar y Activar (Lógica de color)
    limpiarClasesActivas(linkDashboard);
    limpiarClasesActivas(linkResidentes);
    // Limpiamos la página actual también, por si el HTML tuviera clases hardcodeadas
    limpiarClasesActivas(linkPagosGastos); 
    
    // ACTIVAMOS SOLO LA PÁGINA ACTUAL
    activarLink(linkPagosGastos); 

    // 4. CONFIRMAR CARGA (Feedback y Conexión de Botón)
    tituloSeccion.textContent = `Finanzas de Comunidad ID: ${comunidadId}`;

    // Conectar el botón a la nueva vista de formulario
    if(btnNuevaTransaccion) {
        btnNuevaTransaccion.addEventListener('click', () => {
            window.location.href = `../nueva-transaccion/nueva-transaccion.html?comunidadId=${comunidadId}&returnUrl=../pagos-gastos/pagos-gastos.html`;
        });
    }

    // NOTA: Aquí continuaría tu lógica para cargar el informe financiero si la tuvieras.
});