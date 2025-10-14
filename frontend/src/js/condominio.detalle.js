  const form = document.getElementById('form-residente');
  const lista = document.getElementById('lista-residentes');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-residente').value.trim();
    const unidad = document.getElementById('unidad-residente').value.trim();

    if (!nombre || !unidad) return;

    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-white p-4 rounded shadow';

    const info = document.createElement('div');
    info.innerHTML = `<p class="font-medium">${nombre}</p><p class="text-sm text-gray-500">Unidad ${unidad}</p>`;

    const acciones = document.createElement('div');
    acciones.className = 'flex gap-2';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600';
    btnEditar.textContent = '✏️ Editar';
    btnEditar.onclick = () => {
      document.getElementById('nombre-residente').value = nombre;
      document.getElementById('unidad-residente').value = unidad;
      lista.removeChild(li);
    };

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700';
    btnEliminar.textContent = '🗑️ Eliminar';
    btnEliminar.onclick = () => lista.removeChild(li);

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    li.appendChild(info);
    li.appendChild(acciones);
    lista.appendChild(li);

    form.reset();
  });