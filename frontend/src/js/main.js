import '../css/main.css';
import { loadView } from './router.js';

// Esperamos a que el DOM del 'index.html' principal esté listo.
document.addEventListener('DOMContentLoaded', () => {
  
  // --- LÓGICA DEL SIDEBAR (GLOBAL) ---
  // Estos elementos son parte del layout principal, por eso su lógica va aquí.
  const sidebarToggle = document.getElementById('sidebar-toggle'); // CORRECCIÓN: ID actualizado.
  const sidebar = document.getElementById('sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que el click se propague al listener del body.
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // --- NAVEGACIÓN SPA (GLOBAL) ---
  // Usamos el body para capturar todos los clics de navegación.
  document.body.addEventListener('click', e => {
    // Si se hace clic en un enlace de una vista...
    const link = e.target.closest('[data-view]');
    if (link) {
      e.preventDefault();
      const viewName = link.dataset.view;
      loadView(viewName);
      
      // MEJORA UX: Si estamos en móvil, cerramos el sidebar después de hacer clic.
      if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
      }
      return; // Salimos para no ejecutar el código de abajo.
    }

    // Si se hace clic fuera del sidebar en móvil, también lo cerramos.
    if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
        if (!sidebar.contains(e.target)) {
            sidebar.classList.add('-translate-x-full');
        }
    }
  });

  // --- CARGA DE LA VISTA INICIAL ---
  // CORRECCIÓN: Cargamos 'dashboard' como la vista por defecto.
  loadView('dashboard'); 
});

