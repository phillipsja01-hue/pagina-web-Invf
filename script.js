// === DATOS ===
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { usuario: 'admin', contraseña: '1234', rol: 'admin' },
    { usuario: 'user', contraseña: 'user123', rol: 'usuario' }
];
let productos = JSON.parse(localStorage.getItem('productos')) || [
    { id: '001', nombre: 'Arroz', categoria: 'cat1', cantidad: 10, precio: 4.00 }
];

// === ELEMENTOS (Ahora solo usamos los que están en todas las páginas) ===
const loginContainer = document.getElementById('login-container');
const logoutBtn = document.getElementById('logout-btn');

// El resto de elementos como navLinks, tablaBody, mainApp, etc., deben ser buscados
// solo dentro de la página HTML donde existen para evitar errores.

// === MODALES (Solo se inicializan si existen en la página) ===
let modalEditar;
if (document.getElementById('modalEditar')) {
    modalEditar = new bootstrap.Modal('#modalEditar');
}

let modalUsuario;
if (document.getElementById('modalAgregarUsuario')) {
    modalUsuario = new bootstrap.Modal('#modalAgregarUsuario');
}


// === INICIO Y AUTENTICACIÓN (Lógica central corregida) ===

// 🔑 NUEVA FUNCIÓN: Verificar y forzar la autenticación en cada página
function checkAuth() {
    const isAuthenticated = localStorage.getItem('sesionIniciada') === 'true';
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

    if (!isAuthenticated) {
        // Si no está autenticado, siempre debe ir al login (solo index.html lo contiene)
        if (!isLoginPage) {
            window.location.href = 'index.html';
        }
    } else {
        // Si está autenticado
        if (isLoginPage) {
            // Si inicia sesión y está en el login, redirigir a la home.
            window.location.href = 'home.html'; 
        }
        // Mostrar el botón de logout en todas las páginas autenticadas
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
        }
    }
}

// Llama a la verificación al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth);


// === LOGIN CORREGIDO ===
if (document.getElementById('login-form')) {
    document.getElementById('login-form').onsubmit = e => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;
        const valido = usuarios.find(u => u.usuario === user && u.contraseña === pass);

        if (valido) {
            localStorage.setItem('sesionIniciada', 'true');
            localStorage.setItem('usuarioActual', user);
            alert('¡Inicio de sesión exitoso!');
            
            // 🔑 CORRECCIÓN CLAVE: Redirección inmediata a home.html
            window.location.href = 'home.html';
            
        } else {
            alert('Credenciales incorrectas');
        }
    };
}


// === LOGOUT CORREGIDO ===
if (logoutBtn) {
    logoutBtn.onclick = () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('sesionIniciada');
            localStorage.removeItem('usuarioActual');
            // Redirige al login, que forzará el cierre de la app
            window.location.href = 'index.html'; 
        }
    };
}


// ❌ FUNCIÓN ELIMINADA: mostrarApp (Ya no es necesaria, la redirección lo maneja)
// ❌ FUNCIÓN ELIMINADA: inicializarNavegacion (Ya no es necesaria, la navegación es por HTML)


// === PRODUCTOS (Asegurar que solo corra en productos.html) ===
// Nota: La variable tablaBody debe ser declarada dentro del bloque si se usa, 
// o globalmente y verificada. La modifico para que sea local a la función.

function renderizarTabla(filtro = '') {
    const tablaBody = document.querySelector('#productos tbody');
    if (!tablaBody) return; // Salir si no estamos en productos.html

    tablaBody.innerHTML = '';
    const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.id.includes(filtro) ||
        (filtro.startsWith('cat') && p.categoria === filtro)
    );
    // ... (el resto de tu función renderizarTabla se mantiene igual)
    filtrados.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria === 'cat1' ? 'Categoría A' : 'Categoría B'}</td>
            <td>${p.cantidad}</td>
            <td>$${parseFloat(p.precio).toFixed(2)}</td>
            <td>
                <button class="btn btn-warning btn-sm editar" data-id="${p.id}">Editar</button>
                <button class="btn btn-danger btn-sm eliminar" data-id="${p.id}">Eliminar</button>
            </td>
        `;
        tablaBody.appendChild(tr);
    });
    document.querySelectorAll('.editar').forEach(b => b.onclick = abrirEditar);
    document.querySelectorAll('.eliminar').forEach(b => b.onclick = eliminarProducto);
}

function generarId() {
    const max = productos.reduce((m, p) => p.id > m ? p.id : m, '000');
    return String(parseInt(max) + 1).padStart(3, '0');
}

// === Lógica de AGREGAR (Asegurar que solo corra en agregar.html) ===
if (document.getElementById('form-agregar')) {
    document.getElementById('form-agregar').onsubmit = e => {
        e.preventDefault();
        const nuevo = {
            id: generarId(),
            nombre: document.getElementById('nombre').value.trim(),
            categoria: document.getElementById('categoria').value,
            cantidad: parseInt(document.getElementById('cantidad').value),
            precio: parseFloat(document.getElementById('precio').value).toFixed(2)
        };
        productos.push(nuevo);
        guardar();
        e.target.reset();
        alert('¡Producto agregado! (Refresca la página Productos para verlo)');
    };
}

// === Lógica de EDITAR (Asegurar que solo corra en productos.html) ===
function abrirEditar(e) {
    if (!modalEditar) return; // Si no existe el modal, salir
    const id = e.target.dataset.id;
    const p = productos.find(x => x.id === id);
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-nombre').value = p.nombre;
    document.getElementById('edit-categoria').value = p.categoria;
    document.getElementById('edit-cantidad').value = p.cantidad;
    document.getElementById('edit-precio').value = p.precio;
    modalEditar.show();
}

if (document.getElementById('form-editar')) {
    document.getElementById('form-editar').onsubmit = e => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const p = productos.find(x => x.id === id);
        p.nombre = document.getElementById('edit-nombre').value.trim();
        p.categoria = document.getElementById('edit-categoria').value;
        p.cantidad = parseInt(document.getElementById('edit-cantidad').value);
        p.precio = parseFloat(document.getElementById('edit-precio').value).toFixed(2);
        guardar();
        renderizarTabla();
        modalEditar.hide();
    };
}

function eliminarProducto(e) {
    if (confirm('¿Eliminar producto?')) {
        productos = productos.filter(p => p.id !== e.target.dataset.id);
        guardar();
        renderizarTabla();
    }
}

// === BÚSQUEDA (Asegurar que solo corra en productos.html) ===
if (document.getElementById('form-buscar')) {
    document.getElementById('form-buscar').onsubmit = e => {
        e.preventDefault();
        renderizarTabla(document.getElementById('buscar').value);
    };
    document.getElementById('buscar').oninput = () => renderizarTabla(document.getElementById('buscar').value);
    document.querySelectorAll('.cat-link').forEach(a => {
        a.onclick = e => {
            e.preventDefault();
            const cat = a.getAttribute('href').substring(1);
            document.getElementById('buscar').value = cat === 'cat3' ? '' : '';
            renderizarTabla(cat === 'cat3' ? '' : cat);
        };
    });
}

// === REPORTES (Asegurar que solo corra en reportes.html) ===
if (document.getElementById('btn-generar-reporte')) {
    document.getElementById('btn-generar-reporte').onclick = () => {
        const total = productos.reduce((s, p) => s + p.cantidad, 0);
        const valor = productos.reduce((s, p) => s + (p.cantidad * p.precio), 0).toFixed(2);
        alert(`REPORTE\nProductos: ${productos.length}\nUnidades: ${total}\nValor: $${valor}`);
    };
}


// === CONFIGURACIÓN (Asegurar que solo corra en configuracion.html) ===
function cargarConfiguracion() {
    const lista = document.getElementById('lista-usuarios');
    if (!lista) return; // Salir si no estamos en configuracion.html
    
    lista.innerHTML = '';
    usuarios.forEach(u => {
        if (u.usuario === localStorage.getItem('usuarioActual')) return;
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${u.usuario}</strong> (${u.rol})</span>
            <button class="btn-small btn-danger eliminar-usuario" data-usuario="${u.usuario}">Eliminar</button>`;
        lista.appendChild(li);
    });
    document.querySelectorAll('.eliminar-usuario').forEach(b => {
        b.onclick = function() {
            if (confirm('¿Eliminar usuario?')) {
                usuarios = usuarios.filter(x => x.usuario !== this.dataset.usuario);
                guardar();
                cargarConfiguracion();
            }
        };
    });
}

if (document.getElementById('btn-agregar-usuario')) {
    document.getElementById('btn-agregar-usuario').onclick = () => modalUsuario.show();
}

if (document.getElementById('form-nuevo-usuario')) {
    document.getElementById('form-nuevo-usuario').onsubmit = e => {
        e.preventDefault();
        const user = document.getElementById('nuevo-usuario').value.trim();
        const pass = document.getElementById('nueva-contraseña').value;
        if (user && pass && !usuarios.some(u => u.usuario === user)) {
            usuarios.push({ usuario: user, contraseña: pass, rol: 'usuario' });
            guardar();
            cargarConfiguracion();
            modalUsuario.hide();
            e.target.reset();
        } else {
            alert('Usuario ya existe o datos inválidos');
        }
    };
}

if (document.getElementById('form-cambiar-pass')) {
    document.getElementById('form-cambiar-pass').onsubmit = e => {
        e.preventDefault();
        const nueva = document.getElementById('nueva-pass').value;
        const conf = document.getElementById('confirmar-pass').value;
        if (nueva === conf && nueva.length >= 4) {
            const actual = usuarios.find(u => u.usuario === localStorage.getItem('usuarioActual'));
            actual.contraseña = nueva;
            guardar();
            alert('Contraseña actualizada');
            e.target.reset();
        } else {
            alert('Error en contraseña');
        }
    };
}

if (document.getElementById('btn-limpiar-datos')) {
    document.getElementById('btn-limpiar-datos').onclick = () => {
        if (confirm('¿BORRAR TODO?')) {
            productos = [];
            guardar();
            // Ya no es necesario renderizarTabla aquí, la limpieza es suficiente
        }
    };
}

// === UTILIDADES ===
function guardar() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// === Carga Inicial Específica de Módulos ===
// Asegura que las tablas y configuraciones se muestren al cargar la página correspondiente
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en productos.html
    if (document.querySelector('#productos tbody')) {
        renderizarTabla();
    }
    // Si estamos en configuracion.html
    if (document.getElementById('lista-usuarios')) {
        cargarConfiguracion();
    }
});