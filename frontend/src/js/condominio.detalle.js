// --- COMITIVA ---
const formComitiva = document.getElementById('form-comitiva');
const listaComitiva = document.getElementById('lista-comitiva');

formComitiva.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre-comitiva').value.trim();
  const cargo = document.getElementById('cargo-comitiva').value.trim();

  if (!nombre || !cargo) return;

  const li = document.createElement('li');
  li.className = 'flex justify-between items-center bg-white p-4 rounded shadow';

  const info = document.createElement('div');
  info.innerHTML = `<p class="font-medium">${nombre}</p><p class="text-sm text-gray-500">${cargo}</p>`;

  const acciones = document.createElement('div');
  acciones.className = 'flex gap-2';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600';
  btnEditar.textContent = '✏️ Editar';
  btnEditar.onclick = () => {
    document.getElementById('nombre-comitiva').value = nombre;
    document.getElementById('cargo-comitiva').value = cargo;
    listaComitiva.removeChild(li);
  };

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700';
  btnEliminar.textContent = '🗑️ Eliminar';
  btnEliminar.onclick = () => listaComitiva.removeChild(li);

  acciones.appendChild(btnEditar);
  acciones.appendChild(btnEliminar);

  li.appendChild(info);
  li.appendChild(acciones);
  listaComitiva.appendChild(li);

  formComitiva.reset();
});

// --- RESIDENTES ---
const formResidente = document.getElementById('form-residente');
const listaResidentes = document.getElementById('lista-residentes');

formResidente.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre-residente').value.trim();
  const unidad = document.getElementById('domicilio-residente').value.trim();
  const correo = document.getElementById('correo-residente').value.trim();
  const telefono = document.getElementById('tel-residente');

  if (!nombre || !unidad ||  !correo || !telefono ) return;
  
  const li = document.createElement('li');
  li.className = 'flex justify-between items-center bg-white p-4 rounded shadow';

  const info = document.createElement('div');
  info.innerHTML = `
    <p class="font-medium">${nombre}</p>
    <p class="text-sm text-gray-500">Unidad ${unidad}</p>
    <p class="text-sm text-gray-400">${correo}</p>
    <p class="text-sm text-gray-400">${telefono}</p>
  `;

  const acciones = document.createElement('div');
  acciones.className = 'flex gap-2';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600';
  btnEditar.textContent = '✏️ Editar';
  btnEditar.onclick = () => {
    document.getElementById('nombre-residente').value = nombre;
    document.getElementById('unidad-residente').value = unidad;
    document.getElementById('correo-residente').value = correo;
    document.getElementById('tel-residentes').value = telefono;
    listaResidentes.removeChild(li);
  };

  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700';
  btnEliminar.textContent = '🗑️ Eliminar';
  btnEliminar.onclick = () => listaResidentes.removeChild(li);

  acciones.appendChild(btnEditar);
  acciones.appendChild(btnEliminar);

  li.appendChild(info);
  li.appendChild(acciones);
  listaResidentes.appendChild(li);

  formResidente.reset();
});
