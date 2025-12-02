// src/views/nueva-transaccion/nueva-transaccion.js

// --- FUNCIONES TEMPORALES DE ALMACENAMIENTO (Va AFUERA) ---
// Estas funciones manejan la base de datos temporal (LocalStorage)

// Función para obtener transacciones (llave dinámica por comunidad)
const getTransacciones = (id) => {
    const key = `transacciones_${id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
};

// Función para guardar transacciones
const saveTransacciones = (id, transacciones) => {
    const key = `transacciones_${id}`;
    localStorage.setItem(key, JSON.stringify(transacciones));
};

// --- FIN FUNCIONES TEMPORALES ---

document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const form = document.getElementById('transaccion-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formTitle = document.getElementById('form-title');

    // 1. Obtener la comunidad ID y la URL de retorno de la URL
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get('comunidadId'));
    const returnUrl = params.get('returnUrl') || '../pagos-gastos/pagos-gastos.html'; // URL de retorno si no se especifica

    // 2. Validación Inicial
    if (!comunidadId) {
        alert("Error: ID de comunidad no especificado. Volviendo al selector.");
        window.location.replace('../selector-comunidad/selector-comunidad.html'); // Usamos replace para no contaminar el historial
        return;
    }
    
    // 3. Lógica de UI / Eventos
    
    // A. Seteamos la fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;

    // Actualizar título del formulario
    if (formTitle) {
        formTitle.textContent = `Registrar Transacción para ID ${comunidadId}`;
    }

    // B. Manejo del Submit del Formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 3.1. Capturar los datos del formulario
        const formData = new FormData(form);
        const nuevaTransaccion = {
            id: Date.now(), // ID temporal único
            tipo: formData.get('tipo'),
            descripcion: formData.get('descripcion'),
            monto: Number(formData.get('monto')),
            fecha: formData.get('fecha'),
            comunidadId: comunidadId, 
        };
        
        // 3.2. Validaciones
        if (nuevaTransaccion.monto <= 0 || !nuevaTransaccion.tipo) {
            alert("Debe seleccionar un tipo de movimiento y el monto debe ser positivo.");
            return;
        }

        // 3.3. Guardar en LocalStorage (Simulación de Backend)
        const transacciones = getTransacciones(comunidadId);
        transacciones.push(nuevaTransaccion);
        saveTransacciones(comunidadId, transacciones);

        // 3.4. Notificación y Redirección (¡El paso que refresca el reporte!)
        alert(`Transacción de ${nuevaTransaccion.tipo.toUpperCase()} guardada exitosamente.`);
        // Redirige usando el ID de la comunidad
        window.location.href = `${returnUrl}?id=${comunidadId}`; 
    });

    // C. Manejo del Botón Cancelar
    btnCancelar.addEventListener('click', () => {
        // Usa la URL de retorno
        window.location.href = `${returnUrl}?id=${comunidadId}`;
    });
});