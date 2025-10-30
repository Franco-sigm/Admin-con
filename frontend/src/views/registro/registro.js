document.addEventListener('DOMContentLoaded', () => {
    
    // Referencias del DOM
    const form = document.getElementById('form-registro');
    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const passConfirmInput = document.getElementById('password-confirm');
    const errorMessage = document.getElementById('error-message');

    // Key para nuestra "tabla" de usuarios en localStorage
    const USERS_DB_KEY = 'admin_con_users';

    /**
     * Muestra un mensaje de error
     */
    const mostrarError = (mensaje) => {
        errorMessage.textContent = mensaje;
        errorMessage.classList.remove('hidden');
    };

    /**
     * Oculta el mensaje de error
     */
    const ocultarError = () => {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    };

    /**
     * Obtiene los usuarios de la "base de datos"
     * @returns {Array}
     */
    const getUsuarios = () => {
        const usersData = localStorage.getItem(USERS_DB_KEY);
        return usersData ? JSON.parse(usersData) : [];
    };

    /**
     * Guarda los usuarios en la "base de datos"
     * @param {Array} users
     */
    const saveUsuarios = (users) => {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    };


    // --- LÓGICA DE REGISTRO ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitamos que el formulario se envíe
        ocultarError();

        // Obtenemos los valores
        const nombre = nombreInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passInput.value.trim();
        const passwordConfirm = passConfirmInput.value.trim();

        // --- Validaciones ---
        if (!nombre || !email || !password || !passwordConfirm) {
            mostrarError('Todos los campos son obligatorios.');
            return;
        }

        if (password !== passwordConfirm) {
            mostrarError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // --- Verificación de usuario existente ---
        const usuarios = getUsuarios();
        const usuarioExiste = usuarios.find(user => user.email === email);

        if (usuarioExiste) {
            mostrarError('El correo electrónico ya está registrado.');
            return;
        }

        // --- Guardar nuevo usuario ---
        const nuevoUsuario = {
            id: Date.now(), // ID único simple
            nombre: nombre,
            email: email,
            password: password // NOTA: ¡En un proyecto real, NUNCA guardes la contraseña así! Debe ir "hasheada".
        };

        usuarios.push(nuevoUsuario);
        saveUsuarios(usuarios);

        // --- Redirección ---
        alert('¡Registro exitoso! Serás dirigido al inicio de sesión.');
        window.location.href = '/'; // Redirigimos al Login (que es la raíz '/')
    });

});