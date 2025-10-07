import '../css/main.css';
import { loadView } from './router.js';

// Navegación SPA global
document.addEventListener('click', e => {
  const link = e.target.closest('[data-view]');
  if (link) {
    e.preventDefault();
    const view = link.dataset.view;
    loadView(view);
  }
});
