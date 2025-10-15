import { condominios } from '../../js/data.js';
import { loadView } from '../../js/router.js';

export function renderHome() {
  const grid = document.getElementById('grid-condominios');
  if (!grid) return;

  grid.innerHTML = '';

  condominios.forEach(condo => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition';
    card.dataset.view = 'condominio.detalle';
    card.dataset.id = condo.id;

    card.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-800 mb-1">${condo.nombre}</h3>
      <p class="text-sm text-gray-600">${condo.direccion}</p>
      <p class="text-sm text-gray-600 mt-2"><strong>${condo.residentes.length}</strong> residentes</p>
    `;

    card.addEventListener('click', () => {
      sessionStorage.setItem('condominioId', condo.id);
      loadView('condominio.detalle');
    });

    grid.appendChild(card);
  });
}

renderHome();
