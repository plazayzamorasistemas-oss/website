// Objeto de cuentas contables
const cuentas = {
  '1010': 'Caja General',
  '1011': 'Bancos',
  '1210': 'Cuentas por cobrar',
  '1310': 'Inventarios',
  '2210': 'Proveedores',
  '2310': 'Remuneraciones por pagar',
  '3010': 'Capital pagado',
  '3020': 'Utilidades acumuladas',
  '4010': 'Ingresos por ventas',
  '5010': 'Costos de ventas',
  '5110': 'Gastos de Oficina'
};

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'exito', tiempo = 3000) {
  const notificacion = document.getElementById('notificacion');
  notificacion.textContent = mensaje;
  notificacion.className = `notificacion mostrar ${tipo}`;
  
  setTimeout(() => {
    notificacion.classList.remove('mostrar');
  }, tiempo);
}

// Validar código de cuenta
function validarCodigo(input) {
  const codigo = input.value;
  const descripcion=codigo.split(" ");
  const esValido = /^[0-9]{4}$/.test(codigo) && cuentas.hasOwnProperty(codigo);
  const nombreInput = input.parentElement.nextElementSibling.firstElementChild;
  
    nombreInput.value="";
    for (i=1;i<descripcion.length;i++) {
		nombreInput.value = nombreInput.value+" "+descripcion[i];
	}
    input.setAttribute('aria-invalid', 'false');
    return true;
}

// Limpiar campo contrario
function limpiarCampoContrario(input, esDebe) {
  const row = input.closest('tr');
  const campoContrario = row.querySelector(esDebe ? 'td:nth-child(6) input' : 'td:nth-child(5) input');
  
  if (input.value && campoContrario.value) {
    campoContrario.value = '';
    mostrarNotificacion('Solo debe completar Debe o Haber por fila', 'warning');
  }
}

// Calcular totales
function calcularTotales() {
  let totalDebe = 0, totalHaber = 0;
  const filas = document.querySelectorAll('#libro tbody tr');
  
  filas.forEach(row => {
    const debe = parseFloat(row.querySelector('td:nth-child(5) input').value) || 0;
    const haber = parseFloat(row.querySelector('td:nth-child(6) input').value) || 0;
    totalDebe += debe;
    totalHaber += haber;
  });

  const totales = document.getElementById('totales');
  totales.innerHTML = `
    <strong>Total Debe:</strong> ${totalDebe.toLocaleString('es-ES', {minimumFractionDigits: 2})} | 
    <strong>Total Haber:</strong> ${totalHaber.toLocaleString('es-ES', {minimumFractionDigits: 2})}
  `;
  
  if (Math.abs(totalDebe - totalHaber) > 0.01) { // Considera decimales
    totales.className = 'rojo';
    totales.innerHTML += ' <span class="diferencia">(Diferencia: ' + 
      Math.abs(totalDebe - totalHaber).toFixed(2) + ')</span>';
  } else {
    totales.className = 'azul';
    totales.innerHTML += ' <span>✓ Balance correcto</span>';
  }
}

// Agregar nueva fila
function agregarFila(datos = {}) {
  const tbody = document.querySelector('#libro tbody');
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td><input type="date" value="${datos.fecha || ''}" onchange="calcularTotales()"></td>
    <td>
      <input list="cuentas" value="${datos.codigo || ''}" placeholder="Seleccione una cuenta" oninput="validarCodigo(this)">

    <!-- Datalist with predefined options -->
    <datalist id="cuentas">
        <option value="1010 Caja General">
        <option value="1011 Bancos">
        <option value="1210 Cuentas por cobrar">
        <option value="1310 Inventarios">
        <option value="2210 Proveedores">
		<option value="2310 Remuneraciones por pagar">
		<option value="3010 Capital pagado">
		<option value="3020 Utilidades acumuladas">
		<option value="4010 Ingresos por ventas">
		<option value="5010 Costos de ventas">
		<option value="5110 Gastos de oficina">
    </datalist>
    </td>
    <td><input type="text" value="${datos.nombre || ''}" readonly></td>
    <td><input type="text" value="${datos.descripcion || ''}" placeholder="Descripción del asiento"></td>
    <td><input type="number" min="0" step="0.01" value="${datos.debe || ''}"
               oninput="limpiarCampoContrario(this, true); calcularTotales();" placeholder="0.00"></td>
    <td><input type="number" min="0" step="0.01" value="${datos.haber || ''}"
               oninput="limpiarCampoContrario(this, false); calcularTotales();" placeholder="0.00"></td>
    <td><button onclick="eliminarFila(this)" class="btn-danger" aria-label="Eliminar fila">🗑️</button></td>
  `;
  
  tbody.appendChild(row);
  
  // Si se pasó un código, validarlo
  if (datos.codigo) {
    const codigoInput = row.querySelector('td:nth-child(2) input');
    validarCodigo(codigoInput);
  }
}

// Eliminar fila
function eliminarFila(boton) {
  const row = boton.closest('tr');
  row.remove();
  calcularTotales();
  mostrarNotificacion('Fila eliminada correctamente');
}

// Guardar libro en localStorage
function guardarLibro() {
  const filas = [];
  document.querySelectorAll('#libro tbody tr').forEach(row => {
    filas.push({
      fecha: row.querySelector('td:nth-child(1) input').value,
      codigo: row.querySelector('td:nth-child(2) input').value,
      nombre: row.querySelector('td:nth-child(3) input').value,
      descripcion: row.querySelector('td:nth-child(4) input').value,
      debe: row.querySelector('td:nth-child(5) input').value,
      haber: row.querySelector('td:nth-child(6) input').value
    });
  });
  
  //localStorage.setItem('libroDiario', JSON.stringify(filas));
  
  try {
        // Contenido del archivo
        const contenido = JSON.stringify(filas);
        
        // Crear un Blob con el contenido
        const blob = new Blob([contenido], { type: "text/plain" });
        
        // Crear un enlace temporal
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = "librodiario.json"; // Nombre sugerido para el archivo
        
        // Simular clic para descargar
        enlace.click();
        
        // Liberar memoria
        URL.revokeObjectURL(enlace.href);
    } catch (error) {
        console.error("Error al generar el archivo:", error);
    }
  
  mostrarNotificacion('Libro guardado correctamente');
}

// Cargar libro desde localStorage
function cargarLibro() {
  const libroGuardado = localStorage.getItem('libroDiario');
  if (!libroGuardado) {
    //mostrarNotificacion('No hay datos guardados', 'error');
    return;
  }
  
  const tbody = document.querySelector('#libro tbody');
  tbody.innerHTML = '';
  
  JSON.parse(libroGuardado).forEach(fila => {
    agregarFila(fila);
  });
  
  calcularTotales();
  mostrarNotificacion('Libro cargado correctamente');
}

// Exportar a JSON
function exportarAJSON() {
  const filas = [];
  document.querySelectorAll('#libro tbody tr').forEach(row => {
    filas.push({
      fecha: row.querySelector('td:nth-child(1) input').value,
      codigo: row.querySelector('td:nth-child(2) input').value,
      nombre: row.querySelector('td:nth-child(3) input').value,
      descripcion: row.querySelector('td:nth-child(4) input').value,
      debe: row.querySelector('td:nth-child(5) input').value,
      haber: row.querySelector('td:nth-child(6) input').value
    });
  });
  
  const dataStr = JSON.stringify(filas, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `libro-diario-${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Importar desde JSON
function importarDesdeJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const filas = JSON.parse(e.target.result);
      const tbody = document.querySelector('#libro tbody');
      tbody.innerHTML = '';
      
      filas.forEach(fila => {
        agregarFila(fila);
      });
      
      calcularTotales();
      mostrarNotificacion('Datos importados correctamente');
	  document.getElementById("archivoAbierto").value=file.name;
    } catch (error) {
      mostrarNotificacion('Error al importar el archivo', 'error');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Agregar fila inicial
  agregarFila();
  
  // Configurar botones
  document.getElementById('agregar-fila').addEventListener('click', agregarFila);
  document.getElementById('guardar-libro').addEventListener('click', guardarLibro);
  //document.getElementById('cargar-libro').addEventListener('click', cargarLibro);
  
  // Configurar importación
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.style.display = 'none';
  importInput.addEventListener('change', importarDesdeJSON);
  document.body.appendChild(importInput);
  
  document.getElementById('cargar-libro').addEventListener('click', () => {
	importInput.click();
	cargarLibro();
  });
});
