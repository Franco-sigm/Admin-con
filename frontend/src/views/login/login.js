document.addEventListener('DOMContentLoaded', () => {

    // Referencias del DOM
    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Keys de localStorage
    const USERS_DB_KEY = 'admin_con_users';
    const SESSION_KEY = 'admin_con_session';

    /**
     * Muestra un mensaje de error
     */
    const mostrarError = (mensaje) => {
        errorMessage.textContent = mensaje;
        errorMessage.classList.remove('hidden');
    };

    /**
     * Obtiene los usuarios de la "base de datos"
     * @returns {Array}
     */
    const getUsuarios = () => {
        const usersData = localStorage.getItem(USERS_DB_KEY);
        return usersData ? JSON.parse(usersData) : [];
    };

    // --- LÓGICA DE LOGIN ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que el formulario se envíe

        // Obtenemos los valores
        const email = emailInput.value.trim().toLowerCase();
        const password = passInput.value.trim();

        // Validación simple
        if (!email || !password) {
            mostrarError('Email y contraseña son obligatorios.');
            return;
        }

        // --- Verificación de credenciales ---
        const usuarios = getUsuarios();
        
        // 1. Encontrar al usuario por email
        const usuario = usuarios.find(user => user.email === email);

        if (!usuario) {
            mostrarError('Usuario no encontrado.');
            return;
        }

        // 2. Verificar la contraseña
        // (En un sistema real, esto se haría en el backend con la contraseña hasheada)
        if (usuario.password !== password) {
            mostrarError('Contraseña incorrecta.');
            return;
        }

        // --- INICIO DE SESIÓN EXITOSO ---
        
        // 1. "Simulamos" una sesión guardando los datos del usuario logueado
        //    (No guardes la contraseña en la sesión)
        const sesionUsuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesionUsuario));

        // 2. Redirigimos al selector de comunidad
        // (Asegúrate de que esta es la ruta correcta a tu selector)
        window.location.href = '/src/views/selector-comunidad/selector-comunidad.html';
    });

});