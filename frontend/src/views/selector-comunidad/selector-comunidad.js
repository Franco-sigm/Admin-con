/*
 * =========================================
 * selector.comunidades.js
 * =========================================
 * Maneja la lógica de la vista del selector de comunidades.
 */

// ---
// 1. EVENTO PRINCIPAL: Iniciar el script cuando el HTML esté cargado
// ---
document.addEventListener('DOMContentLoaded', () => {
    
    // ---
    // 2. REFERENCIAS A ELEMENTOS DEL DOM
    // ---
    // Obtenemos los elementos del HTML con los que vamos a interactuar.
    const gridComunidades = document.getElementById('grid-comunidades');
    const estadoVacio = document.getElementById('estado-vacio');
    
    // Botones para añadir (hay dos: en el header y en el estado vacío)
    const btnNuevaComunidad = document.getElementById('btn-nueva-comunidad');
    const btnNuevaComunidadVacio = document.getElementById('btn-nueva-comunidad-vacio');

    // ---
    // 3. BASE DE DATOS (SIMULADA CON LOCALSTORAGE)
    // ---
    const DB_KEY = 'mis_comunidades'; // Nombre de nuestra "tabla" en localStorage

    /**
     * Obtiene todas las comunidades desde localStorage.
     * @returns {Array} Un array de objetos de comunidad.
     */
    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY);
        // Si no hay datos, retornamos un array vacío (simulando los datos de ejemplo)
        if (!data) {
            return [];
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
    // 4. FUNCIONES PRINCIPALES (LÓGICA DE LA APLICACIÓN)
    // ---

    /**
     * Dibuja las tarjetas de comunidad en el HTML.
     * Esta es la función más importante: actualiza la UI.
     */
    const renderizarComunidades = () => {
        const comunidades = getComunidades();

        // Limpiamos el grid antes de volver a dibujar
        gridComunidades.innerHTML = '';

        // Comprobamos si hay comunidades
        if (comunidades.length === 0) {
            // No hay comunidades: Mostramos el estado vacío y ocultamos el grid
            estadoVacio.classList.remove('hidden');
            gridComunidades.classList.add('hidden');
        } else {
            // Sí hay comunidades: Ocultamos el estado vacío y mostramos el grid
            estadoVacio.classList.add('hidden');
            gridComunidades.classList.remove('hidden');

            // Creamos una tarjeta HTML por cada comunidad
            comunidades.forEach(comunidad => {
                const cardHTML = `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1">
                    <img src="https://via.placeholder.com/400x200.png?text=${encodeURIComponent(comunidad.nombre)}" 
                         alt="Fachada de ${comunidad.nombre}" 
                         class="w-full h-32 object-cover">

                    <div class="p-5">
                        <h2 class="text-xl font-bold text-gray-800 mb-2">${comunidad.nombre}</h2>
                        <p class="text-gray-600 text-sm mb-4">${comunidad.direccion}</p>
                        
                        <div class="flex justify-between items-center mt-4">
                            <a href="../dashboard-comunidad/dashboard-comunidad.html?id=${comunidad.id}" class="bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                                Administrar
                            </a>
                            
                            <button class="text-red-500 hover:text-red-800 btn-eliminar" 
                                    title="Eliminar" 
                                    data-id="${comunidad.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <button class="text-green-500 hover:text-red-800 btn-editar" title="Editar" data-id="${comunidad.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                `;
                // Añadimos la tarjeta al grid
                gridComunidades.innerHTML += cardHTML;
            });
        }
    };

    /**
     * Lógica para añadir una nueva comunidad.
     */
    const agregarComunidad = () => {
        window.location.href = '../nueva-comunidad/nueva-comunidad.html';
    };

    /**
     * Lógica para eliminar una comunidad.
     * @param {number} id - El ID de la comunidad a eliminar.
     */
    const eliminarComunidad = (id) => {
        // Pedimos confirmación
        if (!confirm("¿Estás seguro de que quieres eliminar esta comunidad?")) {
            return;
        }

        // Obtenemos los datos actuales
        let comunidades = getComunidades();

        // Filtramos el array, dejando fuera la comunidad con el id
        comunidades = comunidades.filter(comunidad => comunidad.id !== id);

        // Guardamos el array filtrado
        saveComunidades(comunidades);

        // Volvemos a dibujar la UI
        renderizarComunidades();
    };

    // ---
    // 5. EVENT LISTENERS (Conectores)
    // ---

    // Asignamos la función 'agregarComunidad' a los dos botones de "Añadir"
    btnNuevaComunidad.addEventListener('click', agregarComunidad);
    btnNuevaComunidadVacio.addEventListener('click', agregarComunidad);

    // Listener para los botones de ELIMINAR (Usando Delegación de Eventos)
    // Escuchamos los clics en todo el 'grid', pero solo reaccionamos
    // si el clic fue en un elemento con la clase 'btn-eliminar'.
    gridComunidades.addEventListener('click', (evento) => {
        // 'closest' busca el elemento padre más cercano que coincida
        const botonEliminar = evento.target.closest('.btn-eliminar');

        if (botonEliminar) {
            // ¡Encontramos un clic en un botón de eliminar!
            // Obtenemos el 'data-id' que pusimos en el HTML
            const id = Number(botonEliminar.dataset.id);
            eliminarComunidad(id);
            return;
        }
       // --- INICIO DE DEPURACIÓN ---
    const botonEditar = evento.target.closest('.btn-editar');
    if (botonEditar) {
        const id = Number(botonEditar.dataset.id);
        // ¡Esta línea ahora sí funcionará!
        window.location.href = `../editar-comunidad/editar-comunidad.html?id=${id}`;
        return;
    }
    });

    // ---
    // 6. INICIO
    // ---
    // Hacemos el primer dibujo de la UI cuando la página carga.
    renderizarComunidades();

});