// src/views/nueva-transaccion/nueva-transaccion.js

// ==========================================
// 1. ZONA DE FUNCIONES DE DATOS (AFUERA)
// ==========================================

// Obtener transacciones
const getTransacciones = (id) => {
    const key = `transacciones_${id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};

// Guardar transacciones
const saveTransacciones = (id, transacciones) => {
    const key = `transacciones_${id}`;
    localStorage.setItem(key, JSON.stringify(transacciones));
};

// Obtener lista de comunidades (PARA OBTENER EL NOMBRE REAL)
const getComunidades = () => {
    const data = localStorage.getItem("mis_comunidades");
    return data ? JSON.parse(data) : [];
};

// ==========================================
// 2. ZONA DE EJECUCIÓN (ADENTRO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- A. REFERENCIAS AL DOM ---
    const form = document.getElementById("transaccion-form");
    const btnCancelar = document.getElementById("btn-cancelar");
    const formTitle = document.getElementById("form-title");
    const fechaInput = document.getElementById("fecha");

    // --- B. OBTENER ID Y CONTEXTO ---
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("comunidadId"));
    const returnUrl = params.get("returnUrl") || "../pagos-gastos/pagos-gastos.html";

    // Validación Básica
    if (!comunidadId) {
        alert("Error: ID de comunidad no especificado.");
        window.location.replace("../selector-comunidad/selector-comunidad.html");
        return;
    }

    // --- C. OBTENER NOMBRE DE LA COMUNIDAD (Lógica Nueva) ---
    const comunidades = getComunidades();
    const comunidadActual = comunidades.find(c => c.id === comunidadId);

    if (!comunidadActual) {
        alert("Error: Comunidad no encontrada en la base de datos.");
        window.location.replace("../selector-comunidad/selector-comunidad.html");
        return;
    }

    // Actualizar el título con el nombre real
    if (formTitle) {
        formTitle.textContent = `Registrar en: ${comunidadActual.nombre}`;
    }

    // --- D. LÓGICA DE UI INICIAL ---
    // Seteamos la fecha de hoy por defecto
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaInput) fechaInput.value = hoy;


    // --- E. MANEJO DEL FORMULARIO ---
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. Capturar datos
        const formData = new FormData(form);
        const nuevaTransaccion = {
            id: Date.now(), 
            tipo: formData.get("tipo"),
            descripcion: formData.get("descripcion"),
            monto: Number(formData.get("monto")),
            fecha: formData.get("fecha"),
            comunidadId: comunidadId, 
        };
        
        // 2. Validaciones
        if (nuevaTransaccion.monto <= 0 || !nuevaTransaccion.tipo) {
            alert("Debe seleccionar un tipo y el monto debe ser positivo.");
            return;
        }

        // 3. Guardar
        const transacciones = getTransacciones(comunidadId);
        transacciones.push(nuevaTransaccion);
        saveTransacciones(comunidadId, transacciones);

        // 4. Feedback y Retorno
        alert("Transacción guardada exitosamente.");
        window.location.href = `${returnUrl}?id=${comunidadId}`; 
    });

    // --- F. BOTÓN CANCELAR ---
    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            window.location.href = `${returnUrl}?id=${comunidadId}`;
        });
    }
});