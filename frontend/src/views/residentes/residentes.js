
 // DB de Comunidades (para leer el nombre)
    const DB_KEY_COMUNIDADES = "mis_comunidades";
    const getComunidades = () => {
        const data = localStorage.getItem(DB_KEY_COMUNIDADES);
        if (!data) return [];
        return JSON.parse(data);
    };


    document.addEventListener("DOMContentLoaded", () => {


    // Referencias al DOM (Layout)
    const tituloSeccion = document.getElementById("comunidad-nombre-titulo");
    const linkDashboard = document.getElementById("link-dashboard"); // (Lo añadiste en el HTML)
    const linkResidentes = document.getElementById("link-residentes");
    const linkPagosGastos = document.getElementById("link-pagos-gastos"); // (Lo añadiste en el HTML)

    // Leer el ID de la comunidad desde la URL
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("id")); // Usamos 'id_comunidad' como definimos
    let comunidadActual;

    if (!comunidadId) {
        tituloSeccion.textContent = "Error: Comunidad no válida";
        return;
    }

    // Encontrar la comunidad y actualizar el layout
    const comunidades = getComunidades();
    comunidadActual = comunidades.find(com => com.id === comunidadId);

    if (comunidadActual) {
        // 1. Actualizar Título
        tituloSeccion.textContent = `Residentes de: ${comunidadActual.nombre}`;
        
        // 2. Actualizar links del Sidebar
        linkDashboard.href = `../dashboard-comunidad/dashboard-comunidad.html?id=${comunidadId}`;
        linkPagosGastos.href = `../pagos-gastos/pagos-gastos.html?id=${comunidadId}`;
        linkResidentes.href = "#"; // ¡Esta es la página activa!
        // (Aquí añadirías los links a Pagos, Áreas, etc. cuando existan)
    } else {
        tituloSeccion.textContent = "Error: Comunidad no encontrada";
        return;
    }

    // ---
    // PARTE 2: LÓGICA DE RESIDENTES (El CRUD)
    // ---

    // ¡NUEVA BASE DE DATOS DINÁMICA!
    const DB_KEY_RESIDENTES = `residentes_${comunidadId}`;

    /**
     * Obtiene los residentes SÓLO de esta comunidad
     */
    const getResidentes = () => {
        const data = localStorage.getItem(DB_KEY_RESIDENTES);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    };

    /**
     * Guarda los residentes SÓLO de esta comunidad
     */
    const saveResidentes = (residentes) => {
        localStorage.setItem(DB_KEY_RESIDENTES, JSON.stringify(residentes));
    };

    // Referencias al DOM (Contenido)
    const tablaBody = document.getElementById("tabla-residentes-body");
    const estadoVacioTabla = document.getElementById("estado-vacio-tabla");
    const btnNuevoResidente = document.getElementById("btn-nuevo-residente");

    /**
     * Dibuja la tabla de residentes
     */
    const renderizarResidentes = () => {
        const residentes = getResidentes();
        tablaBody.innerHTML = ""; // Limpiamos la tabla

        if (residentes.length === 0) {
            estadoVacioTabla.classList.remove("hidden");
        } else {
            estadoVacioTabla.classList.add("hidden");
            
            residentes.forEach(residente => {
                // Definimos el color del estado
                const estadoColor = residente.estado === "Al día" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800";
                
                const filaHTML = `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="p-4">${residente.nombre}</td>
                    <td class="p-4">${residente.unidad}</td>
                    <td class="p-4">${residente.telefono}</td>
                    <td class="p-4">
                        <span class="${estadoColor} text-xs font-medium px-2 py-0.5 rounded-full">
                            ${residente.estado}
                        </span>
                    </td>
                    <td class="p-4 flex gap-2">
                        <button class="text-blue-500 hover:text-blue-800 btn-editar-residente" data-id="${residente.id}" title="Editar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z"></path></svg>
                        </button>
                        <button class="text-red-500 hover:text-red-800 btn-eliminar-residente" data-id="${residente.id}" title="Eliminar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
                `;
                tablaBody.innerHTML += filaHTML;
            });
        }
    };

    
/**
 * Lógica para AÑADIR un nuevo residente
 */
const agregarResidente = () => {
    // ¡NUEVA LÓGICA!
    // Simplemente redirigimos al formulario, pasando el ID de la comunidad.
    // (La variable 'comunidadId' está disponible en este script)
    window.location.href = `../nuevo-residente/nuevo-residente.html?id=${comunidadId}`;
};
// ...

    /**
     * Lógica para ELIMINAR un residente
     */
    const eliminarResidente = (id) => {
        if (!confirm("¿Estás seguro de que quieres eliminar a este residente?")) {
            return;
        }
        let residentes = getResidentes();
        residentes = residentes.filter(r => r.id !== id);
        saveResidentes(residentes);
        renderizarResidentes();
    };

    // ---
    // 3. EVENT LISTENERS
    // ---

    // Botón principal "Añadir Residente"
    btnNuevoResidente.addEventListener("click", agregarResidente);

    // Listeners para la tabla (Editar y Eliminar)
    tablaBody.addEventListener("click", (evento) => {
        // Eliminar
        const btnEliminar = evento.target.closest(".btn-eliminar-residente");
        if (btnEliminar) {
            const id = Number(btnEliminar.dataset.id);
            eliminarResidente(id);
            return;
        }

        // Editar (Aún no hace nada, pero preparamos el botón)
        const btnEditar = evento.target.closest(".btn-editar-residente");
        if (btnEditar) {
            const id = Number(btnEditar.dataset.id);
            
            // Aquí llamaríamos a la lógica de editar,
            // que probablemente nos lleve a un formulario
            window.location.href = `../editar-residente/editar-residente.html?id_comunidad=${comunidadId}&id_residente=${id}`;
            return;
        }
    });

    // ---
    // 4. INICIO
    // ---
    renderizarResidentes(); // Dibujamos la tabla por primera vez

});