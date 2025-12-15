

document.addEventListener('DOMContentLoaded', () => {

    // ---
    // 1. LEER IDs DE LA URL
    // ---
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get('id_comunidad'));
    const residenteId = Number(params.get('id_residente'));

    // ---
    // 2. FUNCIONES DE BASE DE DATOS
    // ---
    // (Necesitamos la DB de residentes de ESTA comunidad)
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
    
    // Si faltan IDs, no podemos hacer nada.
    if (!comunidadId || !residenteId) {
        alert('Error: IDs de comunidad o residente no válidos.');
        window.location.href = '../selector-comunidad/selector-comunidad.html';
        return;
    }

    // Referencias al formulario (IDs del HTML que pegamos)
    const formulario = document.getElementById('form-editar-residente');
    const nombreInput = document.getElementById('residente-nombre');
    const unidadInput = document.getElementById('residente-unidad');
    const telefonoInput = document.getElementById('residente-telefono');
    const estadoInput = document.getElementById('residente-estado');
    const btnCancelar = document.getElementById('btn-cancelar');

    // ---
    // 4. LÓGICA DE NAVEGACIÓN (Botón Cancelar)
    // ---
    // Hacemos que el botón "Cancelar" nos devuelva a la lista de residentes correcta.
    btnCancelar.href = `../residentes/residentes.html?id=${comunidadId}`;

    // ---
    // 5. CARGAR DATOS EN EL FORMULARIO
    // ---
    const todosLosResidentes = getResidentes();
    const residenteParaEditar = todosLosResidentes.find(r => r.id === residenteId);

    if (!residenteParaEditar) {
        alert('Error: Residente no encontrado.');
        window.location.href = `../residentes/residentes.html?id=${comunidadId}`;
        return;
    }

    // ¡Rellenamos el formulario con los datos existentes!
    nombreInput.value = residenteParaEditar.nombre;
    unidadInput.value = residenteParaEditar.unidad;
    telefonoInput.value = residenteParaEditar.telefono;
    estadoInput.value = residenteParaEditar.estado;

    // ---
    // 6. LÓGICA DE GUARDADO (UPDATE)
    // ---
    formulario.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitamos que la página se recargue

        // 1. Leer los nuevos valores del formulario
        const nuevoNombre = nombreInput.value;
        const nuevaUnidad = unidadInput.value;
        const nuevoTelefono = telefonoInput.value;
        const nuevoEstado = estadoInput.value;

        // 2. Usar .map() para actualizar el residente específico
        const residentesActualizados = todosLosResidentes.map(residente => {
            // Si no es el residente que editamos, lo devolvemos tal cual
            if (residente.id !== residenteId) {
                return residente;
            }

            // Si ES el residente, devolvemos un objeto nuevo con los datos actualizados
            return {
                ...residente, // Mantenemos el ID
                nombre: nuevoNombre,
                unidad: nuevaUnidad,
                telefono: nuevoTelefono,
                estado: nuevoEstado
            };
        });

        // 3. Guardar el array actualizado en localStorage
        saveResidentes(residentesActualizados);

        // 4. Redirigir de vuelta a la lista
        alert('Residente actualizado con éxito.');
        window.location.href = `../residentes/residentes.html?id=${comunidadId}`;
    });

});