// frontend/vite.config.js

import { resolve } from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url'; // <-- IMPORTA ESTO

// --- ESTO CREA EL __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
// ---

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
    'registro', // <-- Tu vista de registro
  ];

  const entries = {};
  for (const view of views) {
    entries[view] = resolve(__dirname, `src/views/${view}/${view}.html`);
  }
  
  // npm run build -- --config frontend/vite.config.js
  // Agrega la entrada para login.html
  entries['index'] = resolve(__dirname, 'src/views/login/login.html');

  return entries;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
});