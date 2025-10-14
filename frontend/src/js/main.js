import '../css/main.css';
import { loadView } from './router.js';

// Navegación SPA global (carga todas las vistas de forma dinámica)
document.addEventListener('click', e => {
  const link = e.target.closest('[data-view]');
  if (link) {
    e.preventDefault();
    const view = link.dataset.view;
    loadView(view);
  }
});
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
});
