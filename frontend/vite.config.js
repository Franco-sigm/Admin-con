// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

// Función para generar la lista de archivos HTML
function getHtmlEntries() {
  const views = [
    'dashboard-comunidad',
    'editar-comunidad',
    'editar-residente',
    'nueva-comunidad',
    'nuevo-residente',
    'residentes',
    'selector-comunidad',
  ];

  const entries = {};
  for (const view of views) {
    // Esto crea un "nombre" para cada página, ej: 'dashboard-comunidad'
    // Y le asigna la ruta a su archivo HTML
    entries[view] = resolve(__dirname, `src/views/${view}/${view}.html`);
  }
  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      // Aquí le decimos a Vite dónde están TODAS tus páginas HTML
      input: getHtmlEntries(),
    },
  },
});