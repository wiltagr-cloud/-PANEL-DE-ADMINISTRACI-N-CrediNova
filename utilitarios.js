// Funciones utilitarias para recuperar y mostrar información en pantalla.
function recuperaraTexto(idComponente) {
  const componente = document.getElementById(idComponente);
  return componente ? componente.value : "";
}

function recuperarInt(idComponente) {
  const valorCaja = recuperaraTexto(idComponente);
  const valorEntero = Number.parseInt(valorCaja, 10);
  return Number.isNaN(valorEntero) ? 0 : valorEntero;
}

function recuperarFloat(idComponente) {
  const valorCaja = recuperaraTexto(idComponente);
  const valorFlotante = Number.parseFloat(valorCaja);
  return Number.isNaN(valorFlotante) ? 0 : valorFlotante;
}

function mostrarTexto(idComponente, mensaje) {
  const componente = document.getElementById(idComponente);
  if (componente) componente.textContent = mensaje;
}

function mostrarTextoEnCaja(idComponente, mensaje) {
  const componente = document.getElementById(idComponente);
  if (componente) componente.value = mensaje;
}

function mostrarImagen(idComponente, rutaImagen) {
  const componente = document.getElementById(idComponente);
  if (componente) componente.src = rutaImagen;
}
