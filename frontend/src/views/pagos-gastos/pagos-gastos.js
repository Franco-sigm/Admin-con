// src/views/pagos-gastos/pagos-gastos.js

// ==========================================
// 1. ZONA DE FUNCIONES UNIVERSALES (AFUERA)
// ==========================================

// --- Estilos del Sidebar ---
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

// --- Datos y Utilidades ---

// Obtener transacciones desde LocalStorage
const getTransacciones = (id) => {
    const key = `transacciones_${id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};

// Obtener lista de comunidades (ESTA ES LA LÓGICA CORRECTA QUE FALTABA)
const getComunidades = () => {
    const data = localStorage.getItem("mis_comunidades");
    return data ? JSON.parse(data) : [];
};

// Formatear dinero (CLP)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0
    }).format(amount);
};


// ==========================================
// 2. ZONA DE EJECUCIÓN (ADENTRO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- A. REFERENCIAS AL DOM ---
    
    // Layout y Navegación
    const tituloSeccion = document.getElementById("comunidad-nombre-titulo");
    const linkDashboard = document.getElementById("link-dashboard");
    const linkResidentes = document.getElementById("link-residentes"); 
    const linkPagosGastos = document.getElementById("link-pagos-gastos"); 
    const btnNuevaTransaccion = document.getElementById("btn-nueva-transaccion");

    // Reporte Financiero (Textos de montos)
    const ingresosTotalEl = document.getElementById("ingresos-total");
    const egresosTotalEl = document.getElementById("egresos-total");
    const balanceNetoEl = document.getElementById("balance-neto");
    
    // Reporte Financiero (Tarjeta de fondo)
    const balanceNetoCardEl = document.getElementById("balance-neto-card");

    // Tabla
    const tablaTransaccionesBody = document.getElementById("transacciones-body");
    const sinTransaccionesMsgEl = document.getElementById("sin-transacciones-msg");


    // --- B. VALIDACIÓN Y CONTEXTO ---
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("id"));

    if (!comunidadId) {
        tituloSeccion.textContent = "Error: Comunidad no definida.";
        // Opcional: window.location.replace("../selector-comunidad/selector-comunidad.html");
        return;
    }

    // --- LÓGICA DE NOMBRE (CORREGIDA) ---
    // Buscamos la comunidad en la base de datos real
    const comunidades = getComunidades();
    const comunidadActual = comunidades.find(c => c.id === comunidadId);

    if (!comunidadActual) {
        tituloSeccion.textContent = "Error: Comunidad no encontrada.";
        return;
    }

    // Mostrar nombre en el título
    tituloSeccion.textContent = `Finanzas de: ${comunidadActual.nombre}`;


    // --- C. NAVEGACIÓN Y SIDEBAR ---
    const comunidadHref = `?id=${comunidadId}`;

    // 1. Setear HREFs dinámicos
    if (linkDashboard) linkDashboard.href = `../dashboard-comunidad/dashboard-comunidad.html${comunidadHref}`;
    if (linkResidentes) linkResidentes.href = `../residentes/residentes.html${comunidadHref}`;
    if (linkPagosGastos) linkPagosGastos.href = `../pagos-gastos/pagos-gastos.html${comunidadHref}`;

    // 2. Colorear Sidebar (Activar Pagos y Gastos)
    limpiarClasesActivas(linkDashboard);
    limpiarClasesActivas(linkResidentes);
    limpiarClasesActivas(linkPagosGastos); 
    activarLink(linkPagosGastos);          


    // --- D. FUNCIÓN DE RENDERIZADO DEL REPORTE ---
    const cargarInformeFinanciero = (comunidadId) => {
        const transacciones = getTransacciones(comunidadId);
        
        // Limpiar tabla
        tablaTransaccionesBody.innerHTML = "";
        
        // Variables para totales
        let totalIngresos = 0;
        let totalEgresos = 0;

        // Si no hay datos, mostrar mensaje
        if (transacciones.length === 0) {
            if(sinTransaccionesMsgEl) sinTransaccionesMsgEl.classList.remove("hidden");
        } else {
            if(sinTransaccionesMsgEl) sinTransaccionesMsgEl.classList.add("hidden");
            
            // Ordenar por fecha (más reciente primero)
            transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Dibujar filas y sumar
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
                        <td class="px-4 py-3 text-sm text-gray-900">${t.fecha}</td>
                        <td class="px-4 py-3 text-sm capitalize">${t.tipo}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">${t.descripcion}</td>
                        <td class="px-4 py-3 text-sm font-bold text-right ${tipoColor}">
                            ${signo} ${formatCurrency(t.monto)}
                        </td>
                    </tr>
                `;
                tablaTransaccionesBody.innerHTML += filaHTML;
            });
        }

        // --- CÁLCULOS FINALES ---
        const balanceNeto = totalIngresos - totalEgresos;
        const esPositivo = balanceNeto >= 0;

        // 1. Actualizar Textos (Números)
        if(ingresosTotalEl) ingresosTotalEl.textContent = formatCurrency(totalIngresos);
        if(egresosTotalEl) egresosTotalEl.textContent = formatCurrency(totalEgresos);
        if(balanceNetoEl) balanceNetoEl.textContent = formatCurrency(Math.abs(balanceNeto));

        // 2. Actualizar Estilos del Balance (Texto y Fondo)
        if (balanceNetoEl) {
            balanceNetoEl.classList.remove("text-blue-800", "text-red-800");
            balanceNetoEl.classList.add(esPositivo ? "text-blue-800" : "text-red-800");
        }

        if (balanceNetoCardEl) {
            balanceNetoCardEl.classList.remove("bg-blue-100", "bg-red-100", "bg-green-100");
            balanceNetoCardEl.classList.add(esPositivo ? "bg-blue-100" : "bg-red-100");
        }
    };


    // --- E. INICIALIZACIÓN ---
    
    // 1. Ejecutar reporte
    cargarInformeFinanciero(comunidadId);

    // 2. Configurar botón de acción
    if (btnNuevaTransaccion) {
        btnNuevaTransaccion.href = `../nueva-transaccion/nueva-transaccion.html?comunidadId=${comunidadId}&returnUrl=../pagos-gastos/pagos-gastos.html`;
    }
});