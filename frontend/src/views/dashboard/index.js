// Importamos 'loadView' desde el router para poder navegar a otras vistas
import { loadView } from '../../js/router.js';

// Función para cargar un script dinámicamente y devolver una promesa
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Evitamos cargar el script si ya existe
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}

// Función para dibujar el gráfico de estado de pagos
async function createPaymentStatusChart() {
  const canvas = document.getElementById('payment-status-chart');
  if (!canvas) return; // Si el canvas no existe, no hacemos nada

  try {
    // Cargamos la librería Chart.js desde un CDN
    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    
    // Datos de ejemplo para el gráfico
    const data = {
      labels: ['Al día', 'Pendientes', 'Morosos'],
      datasets: [{
        label: 'Estado de Pagos',
        data: [118, 6, 2], // Corresponde a 'Al día', 'Pendientes', 'Morosos'
        backgroundColor: [
          'rgb(34, 197, 94)',  // Verde para 'Al día'
          'rgb(234, 179, 8)',   // Amarillo para 'Pendientes'
          'rgb(239, 68, 68)'    // Rojo para 'Morosos'
        ],
        hoverOffset: 4
      }]
    };

    // Creamos el gráfico de tipo 'doughnut' (dona)
    new Chart(canvas, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
            text: 'Estado de Pagos'
          }
        }
      }
    });

  } catch (error) {
    console.error("No se pudo cargar Chart.js o crear el gráfico:", error);
    canvas.parentElement.innerHTML = '<p class="text-center text-red-500">No se pudo cargar el gráfico.</p>';
  }
}

// La función 'init' es el punto de entrada que llama nuestro router
export function init() {
  console.log("Vista del Dashboard inicializada.");

  // Llamamos a la función para que cree el gráfico de pagos
  createPaymentStatusChart();

  // NOTA: La lógica para los botones de "Accesos Rápidos" es manejada
  // directamente por el event listener global en 'main.js' que busca
  // el atributo [data-view]. Por lo tanto, no necesitamos añadir
  // event listeners específicos para esos botones aquí.
}
