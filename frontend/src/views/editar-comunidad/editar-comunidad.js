/*
 * =========================================
 * editar-comunidad.js
 * =========================================
 * Controla la lógica del formulario de EDICIÓN de comunidad.
 */

// 1. Esperar a que el HTML (DOM) esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // ---
    // 2. VINCULACIÓN (Datos): Funciones de Base de Datos (Copiadas)
    // ---
    const DB_KEY = 'mis_comunidades';

    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    };

    const saveComunidades = (comunidades) => {
        localStorage.setItem(DB_KEY, JSON.stringify(comunidades));
    };

    // ---
    // 3. REFERENCIAS A ELEMENTOS DEL DOM
    // ---
    const formulario = document.getElementById('form-nueva-comunidad'); // El ID del form es el mismo
    // Necesitamos los campos para rellenarlos
    const nombreInput = document.getElementById('nombre');
    const direccionInput = document.getElementById('direccion');
    const tipoInput = document.getElementById('tipo');
    const unidadesInput = document.getElementById('unidades');

    // ---
    // 4. LÓGICA NUEVA: Leer ID de la URL
    // ---
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get('id'));

    // Si no hay ID o el ID es inválido, redirigimos por seguridad
    if (!comunidadId) {
        alert('Error: ID de comunidad no válido.');
        window.location.href = '../selector-comunidad/selector-comunidad.html';
        return; // Detenemos la ejecución
    }

    // ---
    // 5. LÓGICA NUEVA: Cargar datos y rellenar el formulario
    // ---
    const comunidades = getComunidades();
    const comunidadParaEditar = comunidades.find(com => com.id === comunidadId);

    // Si el ID es válido pero la comunidad no existe (ej. fue borrada)
    if (!comunidadParaEditar) {
        alert('Error: Comunidad no encontrada.');
        window.location.href = '../selector-comunidad/selector-comunidad.html';
        return;
    }

    // ¡Rellenamos el formulario!
    nombreInput.value = comunidadParaEditar.nombre;
    direccionInput.value = comunidadParaEditar.direccion;
    // Asignamos valores por defecto si no existen (buena práctica)
    tipoInput.value = comunidadParaEditar.tipo || 'edificio'; 
    unidadesInput.value = comunidadParaEditar.unidades || '';

    // ---
    // 6. LÓGICA DE GUARDADO (MODIFICADA)
    // ---
    formulario.addEventListener('submit', (event) => {
        
        // 6.1. Prevenir recarga (igual que antes)
        event.preventDefault();

        // 6.2. Leer los NUEVOS valores del formulario (igual que antes)
        const nuevoNombre = nombreInput.value;
        const nuevaDireccion = direccionInput.value;
        const nuevoTipo = tipoInput.value;
        const nuevasUnidades = unidadesInput.value;

        // 6.3. Validación (igual que antes)
        if (nuevoNombre.trim() === '' || nuevaDireccion.trim() === '') {
            alert('Por favor, completa el nombre y la dirección.');
            return;
        }

        // 6.4. LÓGICA MODIFICADA: Actualizar el array
        // Usamos .map() para crear un nuevo array
        const comunidadesActualizadas = comunidades.map(comunidad => {
            // Si esta NO es la comunidad que estamos editando, la devolvemos tal cual
            if (comunidad.id !== comunidadId) {
                return comunidad;
            }

            // Si SÍ es la comunidad, devolvemos un objeto con los datos actualizados
            return {
                ...comunidad, // Mantenemos el 'id' y cualquier otro campo
                nombre: nuevoNombre,
                direccion: nuevaDireccion,
                tipo: nuevoTipo,
                unidades: parseInt(nuevasUnidades) || 0
            };
        });

        // 6.5. Guardar el array completamente actualizado (igual que antes)
        saveComunidades(comunidadesActualizadas);

        // 6.6. Redirigir de vuelta (igual que antes)
        alert('¡Comunidad actualizada con éxito!');
        window.location.href = '../selector-comunidad/selector-comunidad.html';
    });
});