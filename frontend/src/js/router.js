// js/router.js

// --- Contenedor principal de la app ---
const appContainer = document.querySelector('#app');

// Vite prepara todos los index.js dentro de src/views/** para carga dinámica.
const modules = import.meta.glob('/src/views/**/index.js');

/**
 * Carga y muestra una vista dinámicamente en el contenedor principal de la aplicación.
 * @param {string} viewName - El nombre de la carpeta de la vista a cargar (ej. 'home').
 * @param {object} [params={}] - Parámetros opcionales para pasar a la función init de la vista.
 */
export async function loadView(viewName, params = {}) {
  if (!appContainer) {
    console.error("Error Crítico: No se encontró el contenedor #app en index.html.");
    return;
  }

  // --- Construcción de rutas ---
  const modulePath = `/src/views/${viewName}/index.js`;
  const htmlPath = `/src/views/${viewName}/index.html`;

  console.log(`🔄 Intentando cargar vista: ${viewName}`);
  console.log(`Ruta HTML: ${htmlPath}`);
  console.log(`Ruta JS: ${modulePath}`);

  try {
    // 1️⃣ Verifica si el módulo JS de la vista existe
    if (!modules[modulePath]) {
      throw new Error(`No se encontró el módulo para la vista '${viewName}'.`);
    }

    // 2️⃣ Carga el HTML de la vista
    const response = await fetch(htmlPath);
    if (!response.ok) {
      console.error(`❌ Error al obtener HTML para ${viewName}. Estado: ${response.status}`);
      throw new Error(`No se pudo acceder al archivo HTML en: ${htmlPath}`);
    }

    const html = await response.text();

    // 3️⃣ Inyecta el HTML en el contenedor
    appContainer.innerHTML = html;
    console.log(`✅ HTML inyectado correctamente para ${viewName}`);

    // 4️⃣ Importa el módulo JS correspondiente
    const module = await modules[modulePath]();

    // 5️⃣ Espera a que el DOM esté realmente renderizado antes de ejecutar init()
    requestAnimationFrame(async () => {
      // Espera hasta que algún elemento clave del home (como #tab-login) exista
      await waitForElements(() => document.querySelector('#tab-login') || document.querySelector('#login-form'));

      if (module && typeof module.init === 'function') {
        try {
          console.log(`🚀 Ejecutando init() para ${viewName}...`);
          module.init(params);
        } catch (initError) {
          console.error(`⚠️ Error ejecutando init() de ${viewName}:`, initError);
        }
      } else {
        console.warn(`⚠️ La vista '${viewName}' no exporta una función init().`);
      }
    });

  } catch (error) {
    console.error(`💥 Error cargando la vista '${viewName}':`, error);
    appContainer.innerHTML = `
      <div class="text-center p-8 bg-red-100 border border-red-400 rounded-lg">
        <h1 class="text-2xl font-bold text-red-700">¡Ups! Algo salió mal.</h1>
        <p class="text-gray-700 mt-2">No se pudo cargar la vista '${viewName}'. Revisa la consola para más detalles.</p>
      </div>`;
  }
}

/**
 * Espera hasta que una condición sobre el DOM se cumpla (útil para asegurar que el HTML ya esté renderizado).
 * @param {Function} conditionFn - Función que debe devolver true cuando el elemento esté disponible.
 * @param {number} [timeout=2000] - Tiempo máximo en milisegundos antes de abandonar.
 */
function waitForElements(conditionFn, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();

    function check() {
      if (conditionFn()) {
        resolve();
      } else if (performance.now() - start > timeout) {
        console.warn("⏰ Tiempo de espera agotado: los elementos no se encontraron.");
        resolve(); // continúa igual, pero advierte
      } else {
        requestAnimationFrame(check);
      }
    }

    check();
  });
}

// --- Enrutador simplificado ---
function router() {
  console.log("🧭 Router ejecutado: cargando vista 'home'...");
  loadView('home');
}

// --- Event Listeners ---

// Captura clics en enlaces internos tipo <a href="/ruta">
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="/"]');
  if (link) {
    e.preventDefault();
    if (window.location.pathname !== link.pathname || window.location.search !== link.search) {
      history.pushState(null, '', link.href);
    }
    router();
  }
});

// Maneja navegación con los botones del navegador
window.addEventListener('popstate', router);

// --- Carga inicial ---
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM listo. Inicializando router...");
  router();
});
