// ==========================================
// VARIABLES PRINCIPALES
// ==========================================

let clientes = [];
let creditos = [];

let tasaInteres = 15;
let clienteSeleccionado = null;
let montoCalculado = 0;
let plazoIngresado = 0;
let cuotaCalculada = 0;
let creditoAprobado = false;


// ==========================================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================================

function ocultarSecciones() {
    const secciones = document.querySelectorAll("section");

    secciones.forEach(function(seccion) {
        seccion.classList.remove("activa");
    });
}

function mostrarSeccion(id) {
    ocultarSecciones();

    const seccion = document.getElementById(id);

    if (seccion) {
        seccion.classList.add("activa");
    }

    if (id === "historial") {
        pintarCreditos(creditos);
    }

    if (id === "inicio") {
        actualizarResumen();
    }
}


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(id, texto, tipo) {
    const elemento = document.getElementById(id);

    elemento.textContent = texto;
    elemento.className = "mensaje " + tipo;
}


// ==========================================
// ADMINISTRACIÓN DE CLIENTES
// ==========================================

document.getElementById("formCliente").addEventListener("submit", function(evento) {
    evento.preventDefault();
    guardarCliente();
});

function guardarCliente() {
    const cedula = document.getElementById("cedula").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const ingresos = Number(document.getElementById("ingresos").value);
    const gastos = Number(document.getElementById("gastos").value);

    if (!/^\d{10}$/.test(cedula)) {
        mostrarMensaje("mensajeCliente", "La cédula debe tener 10 dígitos.", "error");
        return;
    }

    if (!nombre || !apellido) {
        mostrarMensaje("mensajeCliente", "Ingrese el nombre y apellido.", "error");
        return;
    }

    if (ingresos < 0 || gastos < 0 || gastos > ingresos) {
        mostrarMensaje(
            "mensajeCliente",
            "Revise los ingresos y gastos. Los gastos no pueden superar los ingresos.",
            "error"
        );
        return;
    }

    const existe = clientes.some(function(cliente) {
        return cliente.cedula === cedula;
    });

    if (existe) {
        mostrarMensaje("mensajeCliente", "Ya existe un cliente con esa cédula.", "error");
        return;
    }

    const cliente = {
        cedula: cedula,
        nombre: nombre,
        apellido: apellido,
        ingresos: ingresos,
        gastos: gastos
    };

    clientes.push(cliente);

    pintarClientes();
    limpiarFormularioCliente();

    mostrarMensaje("mensajeCliente", "Cliente registrado correctamente.", "exito");
    actualizarResumen();
}

function pintarClientes() {
    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = "";

    clientes.forEach(function(cliente) {
        const fila = document.createElement("tr");

        const celdaCedula = document.createElement("td");
        celdaCedula.textContent = cliente.cedula;

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = cliente.nombre;

        const celdaApellido = document.createElement("td");
        celdaApellido.textContent = cliente.apellido;

        const celdaIngresos = document.createElement("td");
        celdaIngresos.textContent = formatoDinero(cliente.ingresos);

        const celdaGastos = document.createElement("td");
        celdaGastos.textContent = formatoDinero(cliente.gastos);

        const celdaAcciones = document.createElement("td");
        const botonEliminar = document.createElement("button");

        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-eliminar";

        botonEliminar.addEventListener("click", function() {
            eliminarCliente(cliente.cedula);
        });

        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaCedula);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaApellido);
        fila.appendChild(celdaIngresos);
        fila.appendChild(celdaGastos);
        fila.appendChild(celdaAcciones);

        tabla.appendChild(fila);
    });
}

function eliminarCliente(cedula) {
    const tieneCreditos = creditos.some(function(credito) {
        return credito.cedula === cedula;
    });

    if (tieneCreditos) {
        alert("No se puede eliminar este cliente porque tiene créditos registrados.");
        return;
    }

    clientes = clientes.filter(function(cliente) {
        return cliente.cedula !== cedula;
    });

    if (clienteSeleccionado && clienteSeleccionado.cedula === cedula) {
        clienteSeleccionado = null;
        limpiarSimulacion();
    }

    pintarClientes();
    actualizarResumen();

    mostrarMensaje("mensajeCliente", "Cliente eliminado correctamente.", "exito");
}

function limpiarFormularioCliente() {
    document.getElementById("formCliente").reset();
}


// ==========================================
// CONFIGURACIÓN DE TASA
// ==========================================

function guardarTasa() {
    const campoTasa = document.getElementById("tasaInteres");
    const nuevaTasa = Number(campoTasa.value);

    if (campoTasa.value.trim() === "" || nuevaTasa < 10 || nuevaTasa > 20) {
        mostrarMensaje(
            "mensajeTasa",
            "Error: la tasa debe estar entre el 10% y el 20%.",
            "error"
        );
        return;
    }

    tasaInteres = nuevaTasa;

    document.getElementById("tasaActual").textContent = tasaInteres + "%";
    document.getElementById("tasaActualInicio").textContent = tasaInteres + "%";

    mostrarMensaje(
        "mensajeTasa",
        "La tasa de interés se guardó correctamente.",
        "exito"
    );

    // Se invalida el cálculo anterior para evitar asignar con una tasa vieja.
    creditoAprobado = false;
    document.getElementById("btnAsignarCredito").disabled = true;
}


// ==========================================
// BÚSQUEDA Y SELECCIÓN DEL CLIENTE
// ==========================================

function buscarClienteSimulacion() {
    const cedula = document.getElementById("cedulaSimulacion").value.trim();

    clienteSeleccionado = clientes.find(function(cliente) {
        return cliente.cedula === cedula;
    }) || null;

    const datos = document.getElementById("datosCliente");

    creditoAprobado = false;
    document.getElementById("btnAsignarCredito").disabled = true;
    document.getElementById("mensajeAsignacion").textContent = "";

    if (!clienteSeleccionado) {
        datos.innerHTML = "<p class='rechazado'>No se encontró un cliente con esa cédula.</p>";
        document.getElementById("resultadoCredito").innerHTML =
            "<h3>Resultado de la simulación</h3><p>Busque un cliente registrado.</p>";
        return;
    }

    const capacidadPago = clienteSeleccionado.ingresos - clienteSeleccionado.gastos;

    datos.innerHTML = `
        <h3>Cliente seleccionado</h3>
        <p><strong>Cédula:</strong> ${clienteSeleccionado.cedula}</p>
        <p><strong>Nombre:</strong> ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}</p>
        <p><strong>Ingresos mensuales:</strong> ${formatoDinero(clienteSeleccionado.ingresos)}</p>
        <p><strong>Gastos mensuales:</strong> ${formatoDinero(clienteSeleccionado.gastos)}</p>
        <p><strong>Disponible mensual:</strong> ${formatoDinero(capacidadPago)}</p>
    `;

    document.getElementById("resultadoCredito").innerHTML =
        "<h3>Resultado de la simulación</h3><p>Ingrese el monto y el plazo para calcular.</p>";
}


// ==========================================
// CÁLCULO Y APROBACIÓN DEL CRÉDITO
// ==========================================

function calcularCredito() {
    if (!clienteSeleccionado) {
        alert("Primero busque y seleccione un cliente registrado.");
        return;
    }

    const campoMonto = document.getElementById("monto");
    const campoPlazo = document.getElementById("plazo");

    const monto = Number(campoMonto.value);
    const plazo = Number(campoPlazo.value);

    creditoAprobado = false;
    document.getElementById("btnAsignarCredito").disabled = true;
    document.getElementById("mensajeAsignacion").textContent = "";

    if (campoMonto.value.trim() === "" || monto <= 0) {
        alert("Ingrese un monto de crédito mayor que cero.");
        return;
    }

    if (campoPlazo.value.trim() === "" || !Number.isInteger(plazo) || plazo < 1 || plazo > 60) {
        alert("El plazo debe ser un número entero entre 1 y 60 meses.");
        return;
    }

    montoCalculado = monto;
    plazoIngresado = plazo;

    // Tasa mensual expresada como porcentaje anual dividido para 12.
    const tasaMensual = (tasaInteres / 100) / 12;

    // Cálculo de cuota fija mensual.
    if (tasaMensual === 0) {
        cuotaCalculada = monto / plazo;
    } else {
        cuotaCalculada =
            monto * tasaMensual /
            (1 - Math.pow(1 + tasaMensual, -plazo));
    }

    const capacidadPago = clienteSeleccionado.ingresos - clienteSeleccionado.gastos;

    // Criterio sencillo del simulador:
    // se aprueba si la cuota no supera el 30% del dinero disponible.
    const limiteCuota = capacidadPago * 0.30;

    creditoAprobado = cuotaCalculada <= limiteCuota && capacidadPago > 0;

    const resultado = document.getElementById("resultadoCredito");

    if (creditoAprobado) {
        resultado.innerHTML = `
            <h3>Resultado de la simulación</h3>
            <p><strong>Monto solicitado:</strong> ${formatoDinero(montoCalculado)}</p>
            <p><strong>Tasa de interés anual:</strong> ${tasaInteres}%</p>
            <p><strong>Plazo:</strong> ${plazoIngresado} meses</p>
            <p><strong>Cuota mensual estimada:</strong> ${formatoDinero(cuotaCalculada)}</p>
            <p><strong>Límite de cuota según capacidad de pago:</strong> ${formatoDinero(limiteCuota)}</p>
            <p class="aprobado">✓ CRÉDITO APROBADO POR EL SIMULADOR</p>
        `;

        document.getElementById("btnAsignarCredito").disabled = false;
    } else {
        resultado.innerHTML = `
            <h3>Resultado de la simulación</h3>
            <p><strong>Monto solicitado:</strong> ${formatoDinero(montoCalculado)}</p>
            <p><strong>Tasa de interés anual:</strong> ${tasaInteres}%</p>
            <p><strong>Plazo:</strong> ${plazoIngresado} meses</p>
            <p><strong>Cuota mensual estimada:</strong> ${formatoDinero(cuotaCalculada)}</p>
            <p><strong>Dinero disponible al mes:</strong> ${formatoDinero(capacidadPago)}</p>
            <p><strong>Límite de cuota del simulador:</strong> ${formatoDinero(limiteCuota)}</p>
            <p class="rechazado">✗ CRÉDITO RECHAZADO POR EL SIMULADOR</p>
        `;
    }
}


// ==========================================
// ASIGNAR Y REGISTRAR CRÉDITO
// ==========================================

function asignarCredito() {
    if (!clienteSeleccionado) {
        mostrarMensaje("mensajeAsignacion", "Primero seleccione un cliente.", "error");
        return;
    }

    if (!creditoAprobado) {
        mostrarMensaje(
            "mensajeAsignacion",
            "No se puede asignar el crédito porque no está aprobado.",
            "error"
        );
        return;
    }

    // Evita registrar dos veces el mismo crédito por un doble clic.
    const credito = {
        cedula: clienteSeleccionado.cedula,
        nombre: clienteSeleccionado.nombre,
        apellido: clienteSeleccionado.apellido,
        monto: montoCalculado,
        tasa: tasaInteres,
        plazo: plazoIngresado,
        cuota: cuotaCalculada
    };

    creditos.push(credito);

    pintarCreditos(creditos);
    actualizarResumen();

    mostrarMensaje(
        "mensajeAsignacion",
        "¡Crédito asignado y registrado correctamente!",
        "exito"
    );

    document.getElementById("btnAsignarCredito").disabled = true;
    creditoAprobado = false;
}


// ==========================================
// BUSCAR CRÉDITOS POR CÉDULA
// ==========================================

function buscarCreditos(cedula) {
    return creditos.filter(function(credito) {
        return credito.cedula === cedula;
    });
}

function buscarCreditosCliente() {
    const cedula = document.getElementById("cedulaBuscarCredito").value.trim();

    if (!cedula) {
        mostrarMensaje("mensajeHistorial", "Ingrese la cédula para buscar.", "error");
        return;
    }

    const resultados = buscarCreditos(cedula);

    pintarCreditos(resultados);

    if (resultados.length === 0) {
        mostrarMensaje(
            "mensajeHistorial",
            "No se encontraron créditos para esa cédula.",
            "error"
        );
    } else {
        mostrarMensaje(
            "mensajeHistorial",
            "Se encontraron " + resultados.length + " crédito(s).",
            "exito"
        );
    }
}


// ==========================================
// MOSTRAR CRÉDITOS EN LA TABLA
// ==========================================

function pintarCreditos(listaCreditos) {
    const tabla = document.getElementById("tablaCreditos");
    tabla.innerHTML = "";

    listaCreditos.forEach(function(credito) {
        const fila = document.createElement("tr");

        const valores = [
            credito.cedula,
            credito.nombre,
            credito.apellido,
            formatoDinero(credito.monto),
            credito.tasa + "%",
            credito.plazo + " meses",
            formatoDinero(credito.cuota)
        ];

        valores.forEach(function(valor) {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });

    if (listaCreditos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 7;
        celda.textContent = "No hay créditos registrados para mostrar.";
        celda.style.textAlign = "center";

        fila.appendChild(celda);
        tabla.appendChild(fila);
    }

    if (listaCreditos.length === creditos.length) {
        document.getElementById("mensajeHistorial").textContent =
            "Total de créditos registrados: " + creditos.length;
        document.getElementById("mensajeHistorial").className = "mensaje";
    }
}


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function formatoDinero(valor) {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    }).format(valor);
}

function actualizarResumen() {
    document.getElementById("totalClientes").textContent = clientes.length;
    document.getElementById("totalCreditos").textContent = creditos.length;
    document.getElementById("tasaActualInicio").textContent = tasaInteres + "%";
}

function limpiarSimulacion() {
    document.getElementById("cedulaSimulacion").value = "";
    document.getElementById("monto").value = "";
    document.getElementById("plazo").value = "";

    document.getElementById("datosCliente").innerHTML =
        "<p>No se ha seleccionado ningún cliente.</p>";

    document.getElementById("resultadoCredito").innerHTML =
        "<h3>Resultado de la simulación</h3><p>Completa los datos para calcular la cuota.</p>";

    document.getElementById("btnAsignarCredito").disabled = true;

    creditoAprobado = false;
    clienteSeleccionado = null;
    montoCalculado = 0;
    plazoIngresado = 0;
    cuotaCalculada = 0;
}


// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("tasaInteres").value = tasaInteres;
    document.getElementById("tasaActual").textContent = tasaInteres + "%";
    document.getElementById("tasaActualInicio").textContent = tasaInteres + "%";

    pintarClientes();
    pintarCreditos(creditos);
    actualizarResumen();
});