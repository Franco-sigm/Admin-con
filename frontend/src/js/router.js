export async function loadView(viewName) {
  try {
    // Cargar el HTML de la vista
    const res = await fetch(`/src/views/${viewName}.html`);
    if (!res.ok) throw new Error(`Vista "${viewName}" no encontrada`);
    const html = await res.text();

    // Inyectar en el contenedor principal
    const app = document.querySelector('#app');
    if (!app) throw new Error('Contenedor #app no existe en index.html');
    app.innerHTML = html;

    // Cargar el script específico de la vista
    const scriptPath = `/src/js/${viewName}.js`;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scriptPath;
    document.body.appendChild(script);
  } catch (error) {
    console.error('Error al cargar la vista:', error.message);
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `<div class="text-red-500 p-4">Error: ${error.message}</div>`;
    }
  }
}
