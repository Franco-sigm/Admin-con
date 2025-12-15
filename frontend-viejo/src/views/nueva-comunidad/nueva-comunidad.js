

// 1. Esperar a que el HTML (DOM) esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // ---
    // 2. VINCULACIÓN (Datos): Funciones de Base de Datos
    // ---
    // Estas funciones SON IDÉNTICAS a las de 'selector-comunidades.js'.
    // Deben serlo para que ambos archivos manipulen la misma "base de datos".
    const DB_KEY = 'mis_comunidades';

    /**
     * Obtiene todas las comunidades desde localStorage.
     * @returns {Array} Un array de objetos de comunidad.
     */
    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY);
        if (!data) {
            return []; // Retorna vacío si no hay nada
        }
        return JSON.parse(data);
    };

    /**
     * Guarda el array completo de comunidades en localStorage.
     * @param {Array} comunidades - El array actualizado.
     */
    const saveComunidades = (comunidades) => {
        localStorage.setItem(DB_KEY, JSON.stringify(comunidades));
    };

    // ---
    // 3. REFERENCIAS A ELEMENTOS DEL DOM
    // ---
    // Obtenemos el formulario completo por su ID
    const formulario = document.getElementById('form-nueva-comunidad');

    // ---
    // 4. LÓGICA PRINCIPAL: Manejar el envío del formulario
    // ---
    formulario.addEventListener('submit', (event) => {
        
        // 4.1. ¡VITAL! Prevenir que el formulario recargue la página
        event.preventDefault();

        // 4.2. Leer los valores de todos los campos del formulario
        const nombre = document.getElementById('nombre').value;
        const direccion = document.getElementById('direccion').value;
        const tipo = document.getElementById('tipo').value;
        const unidades = document.getElementById('unidades').value;

        // 4.3. Validación simple (buena práctica)
        if (nombre.trim() === '' || direccion.trim() === '') {
            alert('Por favor, completa el nombre y la dirección.');
            return; // Detiene la ejecución si faltan datos
        }

        // 4.4. Cargar la base de datos actual
        const comunidades = getComunidades();

        // 4.5. Crear el nuevo objeto "Comunidad"
        const nuevaComunidad = {
            id: Date.now(), // Usamos timestamp como ID único
            nombre: nombre,
            direccion: direccion,
            tipo: tipo,
            unidades: parseInt(unidades) || 0 // Convertimos a número (o 0 si está vacío)
        };

        // 4.6. Añadir la nueva comunidad al array
        comunidades.push(nuevaComunidad);

        // 4.7. Guardar el array actualizado de vuelta en localStorage
        saveComunidades(comunidades);

        // 4.8. VINCULACIÓN (Navegación): Redirigir de vuelta al selector
        alert('¡Comunidad guardada con éxito!'); // Damos feedback al usuario
        
        // Asegúrate de que esta ruta sea correcta para volver a tu selector
        window.location.href = '../selector-comunidad/selector-comunidad.html';
    });

});