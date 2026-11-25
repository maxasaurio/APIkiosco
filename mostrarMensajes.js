//======================================
// MOSTRAR MENSAJES
//======================================

const mostrarMensaje = (mensaje, esError = false) => {

    const areaMensajes = document.querySelector(".mensajes");

    areaMensajes.textContent = mensaje;

    if (esError) {
        areaMensajes.style.backgroundColor = "#f8d7da";
        areaMensajes.style.color = "#721c24";
    } else {
        areaMensajes.style.backgroundColor = "#d4edda";
        areaMensajes.style.color = "#155724";
    }

    areaMensajes.style.padding = "1%";
    areaMensajes.style.borderRadius = "5px";

    setTimeout(() => {

        areaMensajes.textContent = "";

        areaMensajes.style.backgroundColor = "transparent";
        areaMensajes.style.padding = "0";

    }, 2500);

};
