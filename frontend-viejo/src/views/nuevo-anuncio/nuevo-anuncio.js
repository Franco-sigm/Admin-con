// src/views/nuevo-anuncio/nuevo-anuncio.js

// --- FUNCIONES DE DATOS (AFUERA) ---

// Obtener anuncios existentes
const getAnuncios = (id) => {
    const key = `anuncios_${id}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};

// Guardar lista de anuncios
const saveAnuncios = (id, anuncios) => {
    const key = `anuncios_${id}`;
    localStorage.setItem(key, JSON.stringify(anuncios));
};

// Obtener info de la comunidad (para el título)
const getComunidades = () => {
    const data = localStorage.getItem("mis_comunidades");
    return data ? JSON.parse(data) : [];
};

// --- LOGICA PRINCIPAL ---

document.addEventListener("DOMContentLoaded", () => {
    // Referencias
    const form = document.getElementById("anuncio-form");
    const btnCancelar = document.getElementById("btn-cancelar");
    const formTitle = document.getElementById("form-title");

    // 1. Obtener ID
    const params = new URLSearchParams(window.location.search);
    const comunidadId = Number(params.get("id")); // Usaremos 'id' estándar
    
    // El dashboard es el lugar de retorno por defecto
    const returnUrl = `../dashboard-comunidad/dashboard-comunidad.html?id=${comunidadId}`;

    if (!comunidadId) {
        alert("Error: ID no especificado.");
        window.location.replace("../selector-comunidad/selector-comunidad.html");
        return;
    }

    // 2. Mostrar nombre de la comunidad
    const comunidades = getComunidades();
    const comunidadActual = comunidades.find(c => c.id === comunidadId);
    if (comunidadActual) {
        formTitle.textContent = `Publicar en: ${comunidadActual.nombre}`;
    }

    // 3. Manejar el envío
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const nuevoAnuncio = {
            id: Date.now(),
            titulo: formData.get("titulo"),
            prioridad: formData.get("prioridad"),
            mensaje: formData.get("mensaje"),
            fecha: new Date().toLocaleDateString("es-CL"), // Guardamos la fecha legible
            hora: new Date().toLocaleTimeString("es-CL", {hour: "2-digit", minute:"2-digit"}),
            comunidadId: comunidadId
        };

        // Guardar
        const anuncios = getAnuncios(comunidadId);
        // Usamos unshift para que el más nuevo quede primero en la lista
        anuncios.unshift(nuevoAnuncio); 
        saveAnuncios(comunidadId, anuncios);

        alert("Anuncio publicado correctamente.");
        window.location.href = returnUrl;
    });

    // 4. Botón Cancelar
    btnCancelar.addEventListener("click", () => {
        window.location.href = returnUrl;
    });
});