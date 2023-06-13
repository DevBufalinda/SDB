// CONFIGURACION DE LA DATATABLES DESPACHO CLIENTES

$(document).ready(() => {
	const manifiestoModal = $("#manifiesto-modal");
	const manifiestoTable = $("#manifiesto-table");
	const tablaSeriales = $("#tabla-seriales");
	const addSerialsTable = $("#add-serials");

	// Obtener el campo de entrada para los siguientes campos (Encabezado)
	const frtTermsIdInput = $("#frt-terms-id");
	const descInput = $("#desc-id");
	const fechaInput = $("#fecha-id");
	const estadoInput = $("#estado-id");
	const camionInput = $("#camion-id");

	// Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
	const tableManifest = manifiestoTable.DataTable({
	  order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
	  ajax: {
		url: "{% url 'getManifestList' %}",
		dataSrc: "data",
	  },
	  columnDefs: [
		{
		  sortable: false,
		},
		{
		  orderable: false,
		  targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
		},
	  ],
	  columns: [
		{ data: "FrtTermsID" },
		{ data: "Descr" },
		{ data: "User9" },
		{ data: "User7" },
		{ data: "FOBID" },
	  ],
	  scrollY: "60vh",
	  scrollCollapse: true,
	  paging: false,
	  searching: false,
	  deferRender: true,
	});

	// Datatable para el modal de añadir seriales
	addSerialsTable.DataTable({
	  searching: false,
	  lengthChange: false,
	});

	// Agregar un controlador de eventos para el clic del botón de búsqueda
	/* manifiestoModal.on("show.bs.modal", function () {
		$.fn.dataTable
		  .tables({ visible: true, api: true })
		  .columns.adjust();
	}); */

	// Agregar un controlador de eventos para el clic de fila en la tabla
	manifiestoTable.on("click", "tbody tr", function () {
	  // Obtener los datos de la fila seleccionada
	  const data = tableManifest.row(this).data();

	  // Mostrar el valor del encabezado en el campo de entrada deshabilitado
	  frtTermsIdInput.val(data["FrtTermsID"]);
	  descInput.val(data["Descr"]);
	  fechaInput.val(data["User9"]);
	  estadoInput.val(data["User7"]);
	  camionInput.val(data["FOBID"]);

	  if ($.fn.DataTable.isDataTable(tablaSeriales)) {
		tablaSeriales.DataTable().destroy();
	  }

	  // Obtener la información correspondiente a cada FrtTermsID y mostrarla en la tabla principal
	  tablaSeriales
		.DataTable({
		  data: [],
		  columns: [
			{ data: "InvtID" },
			{ data: "Descr" },
			{ data: "QtyOrd" },
			{ data: "QtyShip" },
		  ],
		  columnDefs: [{ targets: "_all" }],
		  scrollY: "50vh",
		  scrollCollapse: true,
		  paging: false,
		  searching: false,
		  deferRender: true,
		})
		.clear()
		.draw();

	  $.ajax({
		url: "{% url 'getSerialsList' %}",
		data: { frt_terms_id: data["FrtTermsID"] },
		success: (data) => {
		  tablaSeriales.DataTable().clear().rows.add(data.data).draw();
		  manifiestoModal.modal("hide");
		},
	  });
	});

	// Agrega un event listener a cada fila de la tabla
	tablaSeriales.on("click", "tbody tr", function () {
	  const filaData = tablaSeriales.DataTable().row(this).data();
	  //  $("#fila-modal-info").text(JSON.stringify(filaData)); MUESTRA EL JSON EN EL MODAL, BORRAR
	  $("#fila-modal").modal("show");
	});

	// Agrega el evento clic al botón de cerrar
	$("#fila-modal #close").on("click", function () {
	  $("#fila-modal").modal("hide");
	});
});