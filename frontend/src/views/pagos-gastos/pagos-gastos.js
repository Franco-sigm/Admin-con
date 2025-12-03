// --- FUNCIONES UNIVERSALES DE ACTIVACIÓN (Van AFUERA) ---
// Estas funciones se usarán en todos los módulos (Dashboard, Residentes, etc.)

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

// Función para obtener transacciones (llave dinámica por comunidad)
const getTransacciones = (id) => {
    const key = `transacciones_${id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};

// Función de utilidad para formatear dinero
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
    }).format(amount);
};

// --- FIN FUNCIONES UNIVERSALES ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. REFERENCIAS AL DOM
    
    // Layout y Navegación
    const tituloSeccion = document.getElementById("comunidad-nombre-titulo");
    const linkDashboard = document.getElementById("link-dashboard");
    const linkResidentes = document.getElementById("link-residentes"); 
    const linkPagosGastos = document.getElementById("link-pagos-gastos"); 
    const btnNuevaTransaccion = document.getElementById("btn-nueva-transaccion");

    // --- REFERENCIAS DEL REPORTE FINANCIERO ---
    const ingresosTotalEl = document.getElementById("ingresos-total");
    const egresosTotalEl = document.getElementById("egresos-total");
    const balanceNetoEl = document.getElementById("balance-neto");
   

    const tablaTransaccionesBody = document.getElementById("transacciones-body");
    
    
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("id"));

    if (!comunidadId) {
        tituloSeccion.textContent = "Error: Comunidad no definida.";
        window.location.replace("../selector-comunidad/selector-comunidad.html");
        return;
    }

    // 3. SETEAR ENLACES DINÁMICOS Y ACTIVAR
    const comunidadHref = `?id=${comunidadId}`;

    if (linkDashboard) linkDashboard.href = `../dashboard-comunidad/dashboard-comunidad.html${comunidadHref}`;
    if (linkResidentes) linkResidentes.href = `../residentes/residentes.html${comunidadHref}`;
    if (linkPagosGastos) linkPagosGastos.href = `../pagos-gastos/pagos-gastos.html${comunidadHref}`;

    limpiarClasesActivas(linkDashboard);
    limpiarClasesActivas(linkResidentes);
    limpiarClasesActivas(linkPagosGastos);
    activarLink(linkPagosGastos);

    tituloSeccion.textContent = `Finanzas de Comunidad ID: ${comunidadId}`;

    // 4. Función para dibujar la tabla y actualizar los totales
    const cargarInformeFinanciero = (comunidadId) => {
        const transacciones = getTransacciones(comunidadId);
        tablaTransaccionesBody.innerHTML = "";

        let totalIngresos = 0;
        let totalEgresos = 0;

        transacciones.forEach(t => {
            const esIngreso = t.tipo === "ingreso";
            if (esIngreso) {
                totalIngresos += t.monto;
            } else {
                totalEgresos += t.monto;
            }

            const tipoColor = esIngreso ? "text-green-600" : "text-red-600";
            const signo = esIngreso ? "+" : "-";

            const filaHTML = `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">${t.fecha}</td>
                    <td class="px-4 py-3 capitalize">${t.tipo}</td>
                    <td class="px-4 py-3">${t.descripcion}</td>
                    <td class="px-4 py-3 font-semibold ${tipoColor}">${signo} ${formatCurrency(t.monto)}</td>
                </tr>
            `;
            tablaTransaccionesBody.innerHTML += filaHTML;
        });

        const balanceNetoCalc = totalIngresos - totalEgresos;
        const balanceColor = balanceNetoCalc >= 0 ? "text-green-600" : "text-red-600";

        ingresosTotalEl.textContent = formatCurrency(totalIngresos);
        egresosTotalEl.textContent = formatCurrency(totalEgresos);
        balanceNetoEl.textContent = formatCurrency(Math.abs(balanceNetoCalc));

        balanceNetoEl.classList.remove("text-green-600", "text-red-600");
        balanceNetoEl.classList.add(balanceColor);
    };

    // 5. INICIALIZACIÓN
    cargarInformeFinanciero(comunidadId);

    // 6. Conectar el botón a la nueva vista de formulario
    if (btnNuevaTransaccion) {
        btnNuevaTransaccion.href = `../nueva-transaccion/nueva-transaccion.html?comunidadId=${comunidadId}&returnUrl=../pagos-gastos/pagos-gastos.html`;
    }
});
