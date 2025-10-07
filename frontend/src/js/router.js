export async function loadView(viewName) {
  const res = await fetch(`/src/views/${viewName}.html`);
  const html = await res.text();
  document.querySelector('#app').innerHTML = html;

  // Eliminar script anterior si existe
  const oldScript = document.querySelector(`script[data-view="${viewName}"]`);
  if (oldScript) oldScript.remove();

  // Crear script con sufijo único para forzar recarga
  const script = document.createElement('script');
  script.type = 'module';
  script.src = `/src/js/${viewName}.js?reload=${Date.now()}`; // 👈 sufijo dinámico
  script.dataset.view = viewName;
  document.body.appendChild(script);
}
