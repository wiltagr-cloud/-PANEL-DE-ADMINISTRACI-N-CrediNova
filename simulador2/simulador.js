
"use strict";

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

let clientes = [];
let creditos = [];
let tasaInteres = 15;

let clienteSeleccionado = null;
let cuotaCalculada = 0;
let montoCalculado = 0;
let plazoCalculado = 0;
let creditoAprobado = false;


// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function ocultarSecciones() {
  document.querySelectorAll("main section").forEach(function (seccion) {
    seccion.classList.remove("activa");
  });

  document.querySelectorAll(".nav-button").forEach(function (boton) {
    boton.classList.remove("seleccionado");
    boton.removeAttribute("aria-current");
  });
}

function mostrarSeccion(id) {
  const seccion = document.getElementById(id);

  if (!seccion) {
    console.error("No existe la sección:", id);
    return;
  }

  ocultarSecciones();
  seccion.classList.add("activa");

  const boton = document.querySelector(
    '.nav-button[data-seccion="' + id + '"]'
  );

  if (boton) {
    boton.classList.add("seleccionado");
    boton.setAttribute("aria-current", "page");
  }
}


// ============================================
// CONFIGURACIÓN DE TASA DE INTERÉS
// ============================================

function guardarTasa() {
  const input = document.getElementById("tasaInteres");
  const tasa = Number(input.value);

  if (
    input.value.trim() === "" ||
    !Number.isFinite(tasa) ||
    tasa < 10 ||
    tasa > 20
  ) {
    mostrarMensaje(
      "mensajeTasa",
      "La tasa debe estar entre 10% y 20%.",
      "error"
    );

    input.setAttribute("aria-invalid", "true");
    input.focus();

    return false;
  }

  tasaInteres = tasa;
  input.removeAttribute("aria-invalid");

  mostrarMensaje(
    "mensajeTasa",
    "Tasa configurada correctamente: " +
      formatoNumero(tasa) + "% anual.",
    "success"
  );

  return true;
}


// ============================================
// BÚSQUEDA DE CLIENTES
// ============================================

function buscarCliente(cedula) {
  const cedulaBuscada = String(cedula).trim();

  return clientes.find(function (cliente) {
    return cliente.cedula === cedulaBuscada;
  }) || null;
}


// ============================================
// REGISTRAR Y ACTUALIZAR CLIENTES
// ============================================

function guardarCliente() {
  const cedulaInput = document.getElementById("cedula");

  const cedula = recuperaraTexto("cedula").trim();
  const nombre = recuperaraTexto("nombre").trim();
  const apellido = recuperaraTexto("apellido").trim();

  const ingresosTexto = recuperaraTexto("ingresos").trim();
  const egresosTexto = recuperaraTexto("egresos").trim();

  const ingresos = Number(ingresosTexto);
  const egresos = Number(egresosTexto);

  // Validar cédula.
  if (!/^\d{10}$/.test(cedula)) {
    mostrarMensaje(
      "mensajeCliente",
      "La cédula debe contener exactamente 10 dígitos.",
      "error"
    );

    cedulaInput.focus();
    return false;
  }

  // Validar nombre y apellido.
  if (!nombre || !apellido) {
    mostrarMensaje(
      "mensajeCliente",
      "Escribe el nombre y el apellido del cliente.",
      "error"
    );

    return false;
  }

  // Validar ingresos y egresos.
  if (
    ingresosTexto === "" ||
    egresosTexto === "" ||
    !Number.isFinite(ingresos) ||
    !Number.isFinite(egresos) ||
    ingresos < 0 ||
    egresos < 0
  ) {
    mostrarMensaje(
      "mensajeCliente",
      "Los ingresos y egresos deben ser números iguales o mayores que cero.",
      "error"
    );

    return false;
  }

  const cliente = {
    cedula: cedula,
    nombre: nombre,
    apellido: apellido,
    ingresos: ingresos,
    egresos: egresos
  };

  // Actualizar un cliente existente.
  if (clienteSeleccionado) {
    const cedulaOriginal = clienteSeleccionado.cedula;

    const indice = clientes.findIndex(function (item) {
      return item.cedula === cedulaOriginal;
    });

    if (indice === -1) {
      mostrarMensaje(
        "mensajeCliente",
        "No se encontró el cliente que intentas actualizar. Vuelve a seleccionarlo.",
        "error"
      );

      limpiar();
      pintarClientes();

      return false;
    }

    // La cédula original se conserva.
    cliente.cedula = cedulaOriginal;
    clientes[indice] = cliente;

    mostrarMensaje(
      "mensajeCliente",
      "Los datos del cliente se actualizaron correctamente.",
      "success"
    );

  } else {
    // Evitar cédulas duplicadas.
    if (buscarCliente(cedula)) {
      mostrarMensaje(
        "mensajeCliente",
        "Ya existe un cliente registrado con esa cédula. Usa Actualizar para modificarlo.",
        "error"
      );

      return false;
    }

    clientes.push(cliente);

    mostrarMensaje(
      "mensajeCliente",
      "Cliente registrado correctamente.",
      "success"
    );
  }

  pintarClientes();
  limpiar(false);

  return true;
}


// ============================================
// MOSTRAR CLIENTES EN LA TABLA
// ============================================

function pintarClientes() {
  const tabla = document.getElementById("tablaClientes");
  const contador = document.getElementById("contadorClientes");

  tabla.replaceChildren();

  if (clientes.length === 0) {
    const fila = document.createElement("tr");
    fila.className = "empty-row";

    const celda = document.createElement("td");
    celda.colSpan = 6;
    celda.textContent =
      "Aún no hay clientes. Registra el primero usando el formulario.";

    fila.appendChild(celda);
    tabla.appendChild(fila);

  } else {
    clientes.forEach(function (cliente) {
      const fila = document.createElement("tr");

      agregarCelda(fila, cliente.cedula);
      agregarCelda(fila, cliente.nombre);
      agregarCelda(fila, cliente.apellido);
      agregarCelda(fila, formatoMoneda(cliente.ingresos));
      agregarCelda(fila, formatoMoneda(cliente.egresos));

      const celdaAcciones = document.createElement("td");
      const grupo = document.createElement("div");

      grupo.className = "action-buttons";

      // Botón actualizar.
      const botonActualizar = document.createElement("button");

      botonActualizar.type = "button";
      botonActualizar.className = "table-action";
      botonActualizar.textContent = "Actualizar";

      botonActualizar.addEventListener("click", function () {
        seleccionarCliente(cliente.cedula);
      });

      // Botón eliminar.
      const botonEliminar = document.createElement("button");

      botonEliminar.type = "button";
      botonEliminar.className = "table-action delete";
      botonEliminar.textContent = "Eliminar";

      botonEliminar.addEventListener("click", function () {
        eliminarCliente(cliente.cedula);
      });

      grupo.append(botonActualizar, botonEliminar);
      celdaAcciones.appendChild(grupo);
      fila.appendChild(celdaAcciones);
      tabla.appendChild(fila);
    });
  }

  contador.textContent =
    clientes.length +
    (clientes.length === 1 ? " cliente" : " clientes");
}


// ============================================
// AGREGAR CELDAS A LA TABLA
// ============================================

function agregarCelda(fila, valor) {
  const celda = document.createElement("td");

  celda.textContent = String(valor);
  fila.appendChild(celda);
}


// ============================================
// SELECCIONAR CLIENTE PARA ACTUALIZAR
// ============================================

function seleccionarCliente(cedula) {
  const cliente = buscarCliente(cedula);

  if (!cliente) {
    mostrarMensaje(
      "mensajeCliente",
      "No se encontró un cliente con esa cédula.",
      "error"
    );

    return;
  }

  clienteSeleccionado = cliente;

  mostrarTextoEnCaja("cedula", cliente.cedula);
  mostrarTextoEnCaja("nombre", cliente.nombre);
  mostrarTextoEnCaja("apellido", cliente.apellido);
  mostrarTextoEnCaja("ingresos", cliente.ingresos);
  mostrarTextoEnCaja("egresos", cliente.egresos);

  // No se permite modificar la cédula durante la actualización.
  const cedulaInput = document.getElementById("cedula");
  cedulaInput.disabled = true;

  document.getElementById("tituloFormulario").textContent =
    "Actualizar cliente";

  document.getElementById("btnGuardarCliente").textContent =
    "Guardar cambios";

  mostrarMensaje(
    "mensajeCliente",
    "Editando a " + cliente.nombre + " " + cliente.apellido +
      ". La cédula no se puede modificar.",
    "success"
  );

  document.getElementById("nombre").focus();

  document.getElementById("formularioCliente").scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


// ============================================
// ELIMINAR CLIENTE
// ============================================

function eliminarCliente(cedula) {
  const cliente = buscarCliente(cedula);

  if (!cliente) {
    mostrarMensaje(
      "mensajeCliente",
      "No se encontró el cliente que deseas eliminar.",
      "error"
    );

    return;
  }

  // Preparado para impedir la eliminación de clientes
  // que tengan créditos asociados en la lista creditos.
  const tieneCreditos = creditos.some(function (credito) {
    return credito.cedulaCliente === cliente.cedula;
  });

  if (tieneCreditos) {
    mostrarMensaje(
      "mensajeCliente",
      "No se puede eliminar este cliente porque tiene créditos asociados.",
      "error"
    );

    return;
  }

  const confirmar = window.confirm(
    "¿Seguro que deseas eliminar a " +
      cliente.nombre + " " + cliente.apellido + "?"
  );

  if (!confirmar) {
    return;
  }

  clientes = clientes.filter(function (item) {
    return item.cedula !== String(cedula);
  });

  if (
    clienteSeleccionado &&
    clienteSeleccionado.cedula === String(cedula)
  ) {
    limpiar();
  }

  pintarClientes();

  mostrarMensaje(
    "mensajeCliente",
    "Cliente eliminado correctamente.",
    "success"
  );
}


// ============================================
// LIMPIAR FORMULARIO
// ============================================

function limpiar(limpiarMensaje) {
  if (limpiarMensaje === undefined) {
    limpiarMensaje = true;
  }

  document.getElementById("formularioCliente").reset();
  document.getElementById("cedula").disabled = false;

  clienteSeleccionado = null;

  document.getElementById("tituloFormulario").textContent =
    "Datos del cliente";

  document.getElementById("btnGuardarCliente").textContent =
    "Guardar cliente";

  document.querySelectorAll("#formularioCliente input").forEach(
    function (input) {
      input.removeAttribute("aria-invalid");
    }
  );

  if (limpiarMensaje) {
    mostrarMensaje("mensajeCliente", "", "");
  }
}


// ============================================
// MOSTRAR MENSAJES
// ============================================

function mostrarMensaje(id, mensaje, tipo) {
  const componente = document.getElementById(id);

  if (!componente) {
    return;
  }

  componente.textContent = mensaje;
  componente.className = "feedback";

  if (tipo) {
    componente.classList.add(tipo);
  }
}


// ============================================
// FORMATO DE NÚMEROS Y DINERO
// ============================================

function formatoNumero(numero) {
  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: 2
  }).format(numero);
}

function formatoMoneda(numero) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}


// ============================================
// INICIALIZAR SISTEMA
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("tasaInteres").value = "15";

  mostrarSeccion("parametros");
  pintarClientes();
});
