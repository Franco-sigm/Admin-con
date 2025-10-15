document.addEventListener('DOMContentLoaded', () => {
    // 1. GESTIÓN DE ESTADO: Guardamos los datos en arrays, no en el DOM.
    let comitiva = [];
    let residentes = [];

    // --- FUNCIÓN GENÉRICA PARA CREAR Y GESTIONAR LISTAS ---
    // Esta función centraliza toda la lógica repetida.
    const setupCrud = (config) => {
        const form = document.getElementById(config.formId);
        const list = document.getElementById(config.listId);
        let data = config.dataArray;

        // Función para "dibujar" la lista completa a partir del estado (el array de datos)
        const render = () => {
            list.innerHTML = ''; // Limpiamos la lista actual
            data.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center bg-white p-4 rounded shadow';
                
                // Usamos una función para generar el HTML del item, más limpio
                li.innerHTML = config.itemTemplate(item);

                // Botones de acción
                const actions = document.createElement('div');
                actions.className = 'flex gap-2';

                // Botón Editar
                const btnEditar = document.createElement('button');
                btnEditar.className = 'bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600';
                btnEditar.textContent = '✏️ Editar';
                btnEditar.onclick = () => {
                    // Llenamos el formulario con los datos del item
                    config.fields.forEach(field => {
                        document.getElementById(field.id).value = item[field.key];
                    });
                    // Eliminamos el item para volver a crearlo al guardar
                    data.splice(index, 1);
                    render(); // Re-dibujamos la lista sin el item
                };

                // Botón Eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700';
                btnEliminar.textContent = '🗑️ Eliminar';
                btnEliminar.onclick = () => {
                    data.splice(index, 1); // Eliminamos el item del array de datos
                    render(); // Re-dibujamos la lista actualizada
                };
                
                actions.appendChild(btnEditar);
                actions.appendChild(btnEliminar);
                li.appendChild(actions);
                list.appendChild(li);
            });
        };
        
        // Event listener para el formulario
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newItem = {};
            // Recolectamos los datos del formulario de forma dinámica
            config.fields.forEach(field => {
                newItem[field.key] = document.getElementById(field.id).value.trim();
            });

            // Validación simple
            if (Object.values(newItem).some(value => !value)) {
                alert('Todos los campos son obligatorios.');
                return;
            }

            data.push(newItem); // Agregamos el nuevo item al array de datos
            render(); // Re-dibujamos toda la lista
            form.reset();
        });

        render(); // Render inicial (si hubiera datos cargados)
    };

    // --- CONFIGURACIÓN PARA LA COMITIVA ---
    setupCrud({
        formId: 'form-comitiva',
        listId: 'lista-comitiva',
        dataArray: comitiva,
        fields: [
            { id: 'nombre-comitiva', key: 'nombre' },
            { id: 'cargo-comitiva', key: 'cargo' }
        ],
        itemTemplate: (item) => `
            <div>
                <p class="font-medium">${item.nombre}</p>
                <p class="text-sm text-gray-500">${item.cargo}</p>
            </div>
        `
    });

    // --- CONFIGURACIÓN PARA LOS RESIDENTES ---
    setupCrud({
        formId: 'form-residente',
        listId: 'lista-residentes',
        dataArray: residentes,
        fields: [
            { id: 'nombre-residente', key: 'nombre' },
            { id: 'domicilio-residente', key: 'domicilio' },
            { id: 'correo-residente', key: 'correo' },
            { id: 'tel-residente', key: 'telefono' }
        ],
        itemTemplate: (item) => `
            <div>
                <p class="font-medium">${item.nombre}</p>
                <p class="text-sm text-gray-500">Unidad ${item.domicilio}</p>
                <p class="text-sm text-gray-400">${item.correo}</p>
                <p class="text-sm text-gray-400">${item.telefono}</p>
            </div>
        `
    });
});