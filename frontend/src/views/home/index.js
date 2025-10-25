// views/home/index.js
import { loadView } from '../../js/router.js';

let registeredUsers = [];

export function init() {
  console.log("--- Iniciando init() de Home ---");

  const tabLogin = document.getElementById('tab-login');
  console.log("tabLogin encontrado:", tabLogin); // LOG 1

  const tabRegister = document.getElementById('tab-register');
  console.log("tabRegister encontrado:", tabRegister); // LOG 2

  const loginForm = document.getElementById('login-form');
  console.log("loginForm encontrado:", loginForm); // LOG 3

  const registerForm = document.getElementById('register-form');
  console.log("registerForm encontrado:", registerForm); // LOG 4

  // Verificación MÁS ESTRICTA
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) {
    console.error("¡ERROR CRÍTICO! Uno o más elementos NO se encontraron. Abortando init().");
    // Puedes añadir aquí qué elemento específico fue null si quieres más detalle
    if (!tabLogin) console.error("tabLogin es null");
    if (!tabRegister) console.error("tabRegister es null");
    if (!loginForm) console.error("loginForm es null");
    if (!registerForm) console.error("registerForm es null");
    return; // Detiene la ejecución aquí mismo
  }

  console.log("Todos los elementos principales encontrados. Añadiendo listeners...");

  // --- Lógica de Pestañas ---
  function showLoginForm() { /* ... tu código ... */ }
  function showRegisterForm() { /* ... tu código ... */ }

  // --- Event Listeners ---
  try {
    tabLogin.addEventListener('click', showLoginForm);
    console.log("Listener añadido a tabLogin"); // LOG 5

    tabRegister.addEventListener('click', showRegisterForm);
    console.log("Listener añadido a tabRegister"); // LOG 6

    loginForm.addEventListener('submit', (event) => { /* ... tu código ... */ });
    console.log("Listener añadido a loginForm"); // LOG 7

    registerForm.addEventListener('submit', (event) => { /* ... tu código ... */ });
    console.log("Listener añadido a registerForm"); // LOG 8

  } catch (error) {
    console.error("¡ERROR al añadir un EventListener!", error); // Captura el error exacto
  }

  console.log("Mostrando login form por defecto...");
  showLoginForm(); // Muestra el login por defecto
  console.log("--- Fin init() de Home ---");
}

// views/home/index.js
// Importa el router si necesitas navegar después
// import { loadView } from '../../js/router.js';

// Array temporal para usuarios (solo demo)


export function init() {
  console.log("Inicializando vista Home (Login/Registro)");

  // --- Selección de Elementos ---
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Verifica que todos los elementos existen
  if (!tabLogin || !tabRegister || !loginForm || !registerForm) {
    console.error("Error: Faltan elementos de UI (tabs o forms). Verifica IDs en HTML.");
    return;
  }

  // --- Lógica para Cambiar Pestañas ---
  function showLoginForm() {
    loginForm.classList.remove('hidden'); // Muestra login
    registerForm.classList.add('hidden'); // Oculta registro
    // Estilos activos para tab Login
    tabLogin.classList.add('border-cyan-500', 'text-cyan-500');
    tabLogin.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');
    // Estilos inactivos para tab Register
    tabRegister.classList.remove('border-cyan-500', 'text-cyan-500');
    tabRegister.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');
  }

  function showRegisterForm() {
    loginForm.classList.add('hidden'); // Oculta login
    registerForm.classList.remove('hidden'); // Muestra registro
    // Estilos inactivos para tab Login
    tabLogin.classList.remove('border-cyan-500', 'text-cyan-500');
    tabLogin.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');
    // Estilos activos para tab Register
    tabRegister.classList.add('border-cyan-500', 'text-cyan-500');
    tabRegister.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-700', 'dark:hover:text-gray-200');
  }

  // --- Event Listeners para las Pestañas ---
  // Cuando se hace clic en "Iniciar Sesión", muestra el form de login
  tabLogin.addEventListener('click', showLoginForm);
  // Cuando se hace clic en "Registrarse", muestra el form de registro
  tabRegister.addEventListener('click', showRegisterForm);

  // --- Lógica de Envío de Formularios (Demo) ---
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // ... tu lógica de login ...
    console.log("Submit Login Form");
    // loadView('condominium-list'); // Ejemplo de navegación
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // ... tu lógica de registro ...
    console.log("Submit Register Form");
    alert('¡Cuenta creada! Ahora puedes iniciar sesión.');
    showLoginForm(); // Muestra el login después de registrarse
  });

  // Asegura que el formulario de login esté visible al inicio
  showLoginForm();
}