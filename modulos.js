//=========================================
// CONFIGURACIÓN DE MOCKAPI
//=========================================
// Endpoint base de MockAPI para los productos.
// NOTA: Si en tu proyecto de MockAPI creaste el recurso como "productos", se usará esa URL.
// Si aún no lo creaste o tu recurso se llama "personas", puedes modificar el nombre aquí:
const API_URL = "https://6a73b2b015e0453fe1b424ed.mockapi.io/productos";

// Lista de productos cargada en memoria desde MockAPI
let productos = [];

//=========================================
// 1. CARGAR TODOS LOS REGISTROS (GET)
//=========================================

const obtenerProductos = () => {

    const contenedor = document.querySelector("#listadoProductos");
    contenedor.innerHTML = "<p>Cargando productos desde MockAPI...</p>";

    fetch(API_URL, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(items => {
        productos = items;
        mostrarProductos(productos);
    })
    .catch(error => {
        console.error('Error al obtener productos:', error);

        let mensajeError = `Error al cargar productos desde MockAPI (${error.message}).`;
        if (error.message.includes("404")) {
            mensajeError = `No se encontró el endpoint <b>"${API_URL}"</b> (Error 404).<br><br>` +
                           `Por favor verifica que hayas creado el recurso <b>productos</b> en tu cuenta de ` +
                           `<a href="https://mockapi.io" target="_blank">mockapi.io</a>, o si tu recurso se llama ` +
                           `<b>personas</b>, cambia la variable <code>API_URL</code> en <code>js/modulos.js</code>.`;
        }

        contenedor.innerHTML = `<p style="color: crimson; text-align: center; padding: 10px;">${mensajeError}</p>`;
        mostrarMensaje("Error al conectar con MockAPI", true);
    });

};

//=========================================
// MOSTRAR PRODUCTOS EN EL DOM
//=========================================

const mostrarProductos = (lista = productos) => {

    const contenedor = document.querySelector("#listadoProductos");

    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = "<p>No hay productos para mostrar.</p>";
        return;
    }

    lista.forEach(p => {

        const precio = p.precio !== undefined ? p.precio : 0;
        const seccion = p.seccion || "General";
        const nombre = p.nombre || "Sin nombre";

        contenedor.innerHTML += `
        <div class="producto">

            <div class="info">
                <p><b>${nombre}</b></p>
                <p>Precio: $${precio}</p>
                <p>Seccion: ${seccion}</p>
            </div>

            <div class="botones">
                <button class="btn-agregar-carrito" onclick="agregarAlCarrito('${p.id}')">
                    Agregar al carrito
                </button>

                <button class="btn-editar" onclick="abrirEditar('${p.id}')">
                    Editar
                </button>

                <button class="btn-eliminar-producto" onclick="eliminarProducto('${p.id}')">
                    Eliminar
                </button>
            </div>

        </div>
        `;

    });

};

//=========================================
// 2. OBTENER UN REGISTRO A BASE DE UN ID (GET POR ID)
//=========================================

const abrirEditar = (id) => {

    fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(producto => {

        const formEditar = document.querySelector("#form-editar");

        formEditar.nombre.value = producto.nombre || "";
        formEditar.precio.value = producto.precio !== undefined ? producto.precio : "";
        formEditar.seccionOriginal.value = producto.seccion || "General";
        formEditar.idProducto.value = producto.id;

        formEditar.style.display = "block";
        formEditar.scrollIntoView({ behavior: "smooth" });

    })
    .catch(error => {
        console.error('Error al cargar producto para editar:', error);
        mostrarMensaje("Error al obtener datos del producto", true);
    });

};

//=========================================
// 3. CREAR NUEVO REGISTRO (POST)
//=========================================

const agregarProducto = (nuevoProducto) => {

    fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(productoCreado => {
        console.log('Producto creado en MockAPI:', productoCreado);
        mostrarMensaje("Producto agregado correctamente");
        obtenerProductos();
    })
    .catch(error => {
        console.error('Error al agregar producto:', error);
        mostrarMensaje("Error al agregar producto en MockAPI", true);
    });

};

//=========================================
// 4. ACTUALIZAR UN REGISTRO (PUT)
//=========================================

const editarProducto = (e) => {

    e.preventDefault();

    const formEditar = document.querySelector("#form-editar");

    const idProducto = formEditar.idProducto.value;
    const nuevoNombre = formEditar.nombre.value.trim();
    const nuevoPrecio = Number(formEditar.precio.value);
    const nuevaSeccion = formEditar.seccionOriginal.value.trim();

    const datosActualizados = {
        nombre: nuevoNombre,
        precio: nuevoPrecio,
        seccion: nuevaSeccion
    };

    fetch(`${API_URL}/${idProducto}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(productoActualizado => {
        console.log('Producto actualizado en MockAPI:', productoActualizado);

        // Actualizar también en el carrito de compras si ya estaba añadido
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const enCarrito = carrito.find(p => p.id == idProducto);

        if (enCarrito) {
            enCarrito.nombre = productoActualizado.nombre;
            enCarrito.precio = productoActualizado.precio;
            localStorage.setItem("carrito", JSON.stringify(carrito));
            mostrarCarrito();
        }

        mostrarMensaje("Producto editado correctamente");

        formEditar.reset();
        formEditar.style.display = "none";

        obtenerProductos();
    })
    .catch(error => {
        console.error('Error al editar producto:', error);
        mostrarMensaje("Error al actualizar producto en MockAPI", true);
    });

};

//=========================================
// 5. ELIMINAR UN REGISTRO A BASE DE UN ID (DELETE)
//=========================================

const eliminarProducto = (id) => {

    if (!confirm("¿Estás seguro de que querés eliminar este producto?")) return;

    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(productoEliminado => {
        console.log(`${productoEliminado.id} registro eliminado de MockAPI`);

        // Si el producto estaba en el carrito, también lo eliminamos
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito = carrito.filter(p => p.id != id);
        localStorage.setItem("carrito", JSON.stringify(carrito));

        mostrarMensaje("Producto eliminado del listado");

        obtenerProductos();
        mostrarCarrito();
    })
    .catch(error => {
        console.error('Error al eliminar producto:', error);
        mostrarMensaje("Error al eliminar producto en MockAPI", true);
    });

};

//=========================================
// BUSCAR PRODUCTOS (FILTRADO LOCAL DE LA LISTA)
//=========================================

const buscarProductos = (productoBuscado) => {
    

    const busquedaNombre = (productoBuscado.nombre || "").trim().toLowerCase();
    const busquedaSeccion = (productoBuscado.seccion || "").trim().toLowerCase();

    const encontrados = productos.filter(p => {

        const nombreP = (p.nombre || "").toLowerCase();
        const seccionP = (p.seccion || "").toLowerCase();

        const coincideNombre = busquedaNombre === "" || nombreP.includes(busquedaNombre);
        const coincideSeccion = busquedaSeccion === "" || seccionP.includes(busquedaSeccion);

        return coincideNombre && coincideSeccion;

    });

    mostrarProductos(encontrados);

};

//=========================================
// CARRITO DE COMPRAS (LOCALSTORAGE)
//=========================================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

//=========================================
// AGREGAR AL CARRITO
//=========================================

const agregarAlCarrito = (id) => {

    const producto = productos.find(p => p.id == id);
    if (!producto) return;

    carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(p => p.id == id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            seccion: producto.seccion || "General",
            nombre: producto.nombre || "Sin nombre",
            precio: producto.precio !== undefined ? Number(producto.precio) : 0,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarMensaje("Producto agregado al carrito");

    mostrarCarrito();

};

//=========================================
// MOSTRAR CARRITO
//=========================================

const mostrarCarrito = () => {

    carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const contenedor = document.querySelector("#listadoCarrito");

    contenedor.innerHTML = "";

    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>El carrito está vacío.</p>";
    }

    carrito.forEach(p => {

        total += p.precio * p.cantidad;

        contenedor.innerHTML += `
        <div class="itemCarrito">

            <div>
                <p><b>${p.nombre}</b></p>
                <p>$${p.precio} x ${p.cantidad}</p>
            </div>

            <button onclick="eliminarDelCarrito('${p.id}')">
                Eliminar
            </button>

        </div>
        `;

    });

    document.querySelector("#total").textContent = "Total: $" + total;

};

//=========================================
// ELIMINAR DEL CARRITO
//=========================================

const eliminarDelCarrito = (id) => {

    carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito = carrito.filter(p => p.id != id);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarMensaje("Producto eliminado del carrito");

    mostrarCarrito();

};

//=========================================
// VACIAR CARRITO
//=========================================

const vaciarCarrito = () => {

    carrito = [];

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarMensaje("Carrito vaciado");

    mostrarCarrito();

};
