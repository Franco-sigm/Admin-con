// js/main.js

// 1. Importa el archivo CSS principal (Vite se encarga de procesarlo)
import '../css/main.css';

// 2. Importa el router. Este es el paso MÁS IMPORTANTE.
//    Importarlo asegura que el código dentro de router.js se ejecute,
//    incluyendo el listener 'DOMContentLoaded' que llama a loadView('home').
import './router.js';

// ¡Eso es todo!
// El archivo router.js ahora contiene la lógica para manejar la carga inicial
// y la navegación básica (que por ahora siempre carga 'home').
// Ya no se necesita el DOMContentLoaded ni listeners de clic específicos aquí,
// ya que router.js maneja la llamada inicial.

console.log("main.js cargado, router inicializado."); // Opcional: para depurar