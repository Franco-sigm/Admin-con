// Referencia al contenedor principal en tu index.html donde se cargarán las vistas.
const appContainer = document.querySelector('#app');

// Vite analiza esta línea y prepara todos los archivos 'index.js' que encuentre
// dentro de cualquier subcarpeta de /src/views/ para ser cargados dinámicamente.
const modules = import.meta.glob('/src/views/**/index.js');

/**
 * Carga y muestra una vista dinámicamente en el contenedor principal de la aplicación.
 * @param {string} viewName - El nombre de la carpeta de la vista a cargar (ej. 'dashboard', 'home', 'condominio-detalle').
 */
export async function loadView(viewName) {
  if (!appContainer) {
    console.error("Error Crítico: No se encontró el contenedor #app en tu index.html.");
    return;
  }

  // Construimos las rutas a los archivos HTML y JS de la vista.
  const modulePath = `/src/views/${viewName}/index.js`;
  const htmlPath = `/src/views/${viewName}/index.html`;

  try {
    // Verificamos si la vista solicitada existe en los módulos que Vite preparó.
    if (!modules[modulePath]) {
      throw new Error(`Router Error: No se encontró el módulo para la vista '${viewName}'. Verifica la ruta y el nombre de los archivos.`);
    }

    // 1. Cargar el contenido HTML de la vista.
    const response = await fetch(htmlPath);
    if (!response.ok) {
      throw new Error(`Network Error: No se encontró el archivo HTML en la ruta: ${htmlPath}`);
    }
    const html = await response.text();

    // 2. Inyectar el HTML en el contenedor de la aplicación.
    appContainer.innerHTML = html;

    // 3. Cargar el módulo JavaScript correspondiente a la vista.
    const module = await modules[modulePath]();
    
    // 4. Ejecutar la función 'init' del módulo para inicializar la lógica de la vista.
    if (module && typeof module.init === 'function') {
      module.init();
    } else {
        console.warn(`Advertencia: La vista '${viewName}' no exporta una función 'init'.`);
    }

  } catch (error) {
    console.error(`Error al cargar la vista '${viewName}':`, error);
    appContainer.innerHTML = `<div class="text-center p-8 bg-red-100 border border-red-400 rounded-lg">
                                <h1 class="text-2xl font-bold text-red-700">¡Ups! Algo salió mal.</h1>
                                <p class="text-gray-700 mt-2">No se pudo cargar la vista '${viewName}'. Revisa la consola para más detalles.</p>
                              </div>`;
  }
}

