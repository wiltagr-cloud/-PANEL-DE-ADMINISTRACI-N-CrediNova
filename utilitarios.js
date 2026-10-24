
// ============================================
// FUNCIONES UTILITARIAS
// ============================================

// Recuperar el texto o valor de un componente.
function recuperaraTexto(idComponente) {
  const componente = document.getElementById(idComponente);

  return componente ? componente.value : "";
}


// Recuperar un número entero.
function recuperarInt(idComponente) {
  const valorCaja = recuperaraTexto(idComponente);
  const valorEntero = Number.parseInt(valorCaja, 10);

  return Number.isNaN(valorEntero) ? 0 : valorEntero;
}


// Recuperar un número decimal.
function recuperarFloat(idComponente) {
  const valorCaja = recuperaraTexto(idComponente);
  const valorFlotante = Number.parseFloat(valorCaja);

  return Number.isNaN(valorFlotante) ? 0 : valorFlotante;
}


// Mostrar un mensaje en un componente.
function mostrarTexto(idComponente, mensaje) {
  const componente = document.getElementById(idComponente);

  if (componente) {
    componente.textContent = mensaje;
  }
}


// Colocar un valor dentro de una caja de texto.
function mostrarTextoEnCaja(idComponente, mensaje) {
  const componente = document.getElementById(idComponente);

  if (componente) {
    componente.value = mensaje;
  }
}


// Mostrar una imagen.
function mostrarImagen(idComponente, rutaImagen) {
  const componente = document.getElementById(idComponente);

  if (componente) {
    componente.src = rutaImagen;
  }
}
