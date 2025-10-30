

document.addEventListener('DOMContentLoaded', () => {

    // ---
    // 1. LEER ID DE LA COMUNIDAD DESDE LA URL
    // ---
    // (Necesitamos saber a qué comunidad pertenece este nuevo residente)
    const params = new URLSearchParams(window.location.search);
    
    // (Asegúrate de que la página anterior envíe el ID como "?id=")
    const comunidadId = Number(params.get('id')); 

    // ---
    // 2. FUNCIONES DE BASE DE DATOS
    // ---
    const DB_KEY_RESIDENTES = `residentes_${comunidadId}`;

    const getResidentes = () => {
        const data = localStorage.getItem(DB_KEY_RESIDENTES);
        if (!data) return [];
        return JSON.parse(data);
    };

    const saveResidentes = (residentes) => {
        localStorage.setItem(DB_KEY_RESIDENTES, JSON.stringify(residentes));
    };

    // ---
    // 3. VALIDACIÓN y REFERENCIAS DOM
    // ---
    
    if (!comunidadId) {
        alert('Error: ID de comunidad no válido. No se puede añadir residente.');
        // (Regresamos al selector general si el ID de la comunidad se pierde)
        window.location.href = '../selector-comunidad/selector-comunidad.html';
        return;
    }

    // Referencias al formulario (IDs del HTML que acabas de corregir)
    const formulario = document.getElementById('form-nuevo-residente');
    const nombreInput = document.getElementById('residente-nombre');
    const unidadInput = document.getElementById('residente-unidad');
    const telefonoInput = document.getElementById('residente-telefono');
    const estadoInput = document.getElementById('residente-estado');
    const btnCancelar = document.getElementById('btn-cancelar');

    // ---
    // 4. LÓGICA DE NAVEGACIÓN (Botón Cancelar)
    // ---
    // Hacemos que "Cancelar" nos devuelva a la lista de residentes correcta.
    btnCancelar.href = `../residentes/residentes.html?id=${comunidadId}`;

    // ---
    // 5. LÓGICA DE GUARDADO (CREATE)
    // ---
    formulario.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitamos que la página se recargue

        // 1. Leer los valores del formulario
        const nombre = nombreInput.value;
        const unidad = unidadInput.value;
        const telefono = telefonoInput.value;
        const estado = estadoInput.value;

        // 2. Validación simple
        if (nombre.trim() === '' || unidad.trim() === '') {
            alert('Por favor, completa al menos el nombre y la unidad.');
            return;
        }

        // 3. Crear el nuevo objeto residente
        const nuevoResidente = {
            id: Date.now(), // ID único
            nombre: nombre,
            unidad: unidad,
            telefono: telefono || 'N/A', // Valor por defecto
            estado: estado
        };

        // 4. Cargar el array actual, añadir el nuevo y guardar
        const todosLosResidentes = getResidentes();
        todosLosResidentes.push(nuevoResidente);
        saveResidentes(todosLosResidentes);

        // 5. Redirigir de vuelta a la lista
        alert('Residente añadido con éxito.');
        window.location.href = `../residentes/residentes.html?id=${comunidadId}`;
    });

});