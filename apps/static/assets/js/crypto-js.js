$(document).ready(() => {
  //Objetos Jquery que hacen referencia a un elemento HTML mediante su selector
  const manifiestoModal = $("#manifiesto-modal");
  const manifiestoTable = $("#manifiesto-table");
  const tablaSeriales = $("#tabla-seriales");
  const addDetailTable = $("#detail-table");
  const detailModal = $("#add-serials-modal");
  const serialTable = $("#add-serials-detail");
  // Obtener el campo de entrada para los siguientes campos (Encabezado)
  const frtTermsIdInput = $("#frt-terms-id");
  const descInput = $("#desc-id");
  const fechaInput = $("#fecha-id");
  const estadoInput = $("#estado-id");
  const camionInput = $("#camion-id");

  //Objeto DOM que hace referencia a un elemento HTML mediante su ID.
  //const closeButton = document.getElementById("close-modal-serials"); // Obtener el botón "Cerrar"

  let frtTermsID; // Definir una variable global para almacenar el valor de FrtTermsID

  // Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
  const tableManifest = manifiestoTable.DataTable({
    order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
    ajax: {
      type: 'GET',
      url: "{% url 'getManifestList' %}",
      dataSrc: "dataManifest",
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ': ' + xhr.statusText;
        if (xhr.status === 404) {
          errorMessage = 'No se encontró la página solicitada.';
        } else if (xhr.status === 500) {
          errorMessage = 'Error interno del servidor.';
        }
        alert('Error en la solicitud Ajax: ' + errorMessage);
      }
    },
    columnDefs: [
      {
        sortable: false,
        orderable: false,
        targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
        //className: 'select-checkbox'
      }
    ],
    columns: [
      { data: "FrtTermsID" },
      { data: "Descr" },
      { data: "User9" },
      { data: "User7" },
      { data: "FOBID" },
    ],
    scrollCollapse: false,
    paging: true,
    searching: false,
    deferRender: true,
    lengthChange: false
  });


  // Agregar un controlador de eventos para el clic de fila en la tabla de #manifiesto-table
  manifiestoTable.on("click", "tbody tr", { passive: true }, function () {

    //Condicion para reinicializar la tabla seriales, Carga de los productos del manifiesto
    if ($.fn.DataTable.isDataTable(tablaSeriales)) {
      tablaSeriales.DataTable().destroy();
    }

    //Condicion para borrar la tabla de ordenes cada vez que se cambia de manifiesto
    if ($.fn.DataTable.isDataTable(addDetailTable)) {
      addDetailTable.DataTable().clear().draw();
    }

    //CAPTURANDO LA FILA SELECCIONADA PARA EL DETALLE DE CADA ORDEN
    const data = tableManifest.row(this).data();
    console.log("detalles del manifiesto");

    // Mostrar el valor del encabezado en el campo de entrada deshabilitado
    frtTermsIdInput.val(data["FrtTermsID"]);
    descInput.val(data["Descr"]);
    fechaInput.val(data["User9"]);
    estadoInput.val(data["User7"]);
    camionInput.val(data["FOBID"]);

    // Asignar el valor de FrtTermsID a la variable global
    frtTermsID = data["FrtTermsID"];

    // Obtener la información correspondiente a cada FrtTermsID y mostrarla en la tabla principal
    tablaSeriales
      .DataTable({
        data: [],
        columns: [
          { data: "InvtID" },
          { data: "Descr" },
          { data: "User5" },
          { data: "QtyOrd" },
          { data: "QtyShip" },
          { data: "cuantos" },
          { data: "cargado" },
        ],
        columnDefs: [{ targets: "_all" }],
        scrollCollapse: true,
        paging: false,
        searching: false,
        deferRender: true
      })
      .clear()
      .draw();
    $.ajax({
      url: "{% url 'getProductList' %}",
      data: { frt_terms_id: data["FrtTermsID"] },
      success: (data) => {
        tablaSeriales.DataTable().clear().rows.add(data.data).draw();
        manifiestoModal.modal("hide");
        console.log(data.data);
      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ': ' + xhr.statusText;
        if (xhr.status === 404) {
          errorMessage = 'No se encontró la página solicitada.';
        } else if (xhr.status === 500) {
          errorMessage = 'Error interno del servidor.';
        }
        alert('Error en la solicitud Ajax: ' + errorMessage);
      }
    });
  });

  let dataLotSerNbr;

  tablaSeriales.on("click", "tbody tr", { passive: true }, function () {

    //Condicion para reinicializar la detalles del producto(#detail-table)
    if ($.fn.DataTable.isDataTable(addDetailTable)) {
      addDetailTable.DataTable().destroy();
    }

    // Obtener los datos de la fila seleccionada
    dataLotSerNbr = tablaSeriales.DataTable().row(this).data();
    console.log("detalles de los productos");
    console.log(dataLotSerNbr);
    console.log("El ID del producto " + dataLotSerNbr.Descr + " es: " + dataLotSerNbr.InvtID);


    // Obtener la información correspondiente a cada FrtTermsID y mostrarla en la tabla principal
    addDetailTable
      .DataTable({
        data: [],
        columns: [
          { data: 'OrdNbr' },
          { data: 'User5' },
          { data: 'QtyOrd' },
          { data: 'cuantos' },
          { data: 'cargado' },
          { data: 'CustID' },
          { data: 'BillName' },
          { data: 'ShiptoID' },
          { data: 'ShipName' },
        ],
        paging: false,
        searching: false,
        deferRender: true
      })
      .clear()
      .draw();
    $.ajax({
      url: "{% url 'getOrdList' %}",
      data: {
        frt_terms_id: frtTermsID, //valor obtenido de la vista getManifestList
        Invt_ID: dataLotSerNbr["InvtID"], //valor obtenido de la vista getProductList
      },
      success: (data) => {
        addDetailTable.DataTable().clear().rows.add(data.data).draw();
        /* se = data.data;
        console.log(se); */
        /* console.log(se[1]); */
        /* for (let index = 0; index <script se.length; index++) {
        const element = se[index];
        console.log(element);
        } */

      },
      error: function (xhr, status, error) {
        var errorMessage = xhr.status + ': ' + xhr.statusText;
        if (xhr.status === 404) {
          errorMessage = 'No se encontró la página solicitada.';
        } else if (xhr.status === 500) {
          errorMessage = 'Error interno del servidor.';
        }
        alert('Error en la solicitud Ajax: ' + errorMessage);
      }
    });
  });

  serialTable.DataTable({
    columns: [
      { data: 'LOTSERNBR' },
      { data: 'InvtID' },
      { data: 'STATUS' },
      { data: 'PESO' },
      { data: 'CESTA' },
      { data: 'PALETA' },
    ],
    scrollCollapse: false,
    paging: true,
    searching: false,
    deferRender: true,
    lengthChange: false
  });


  // Agregar evento click a cada fila de la tabla
  addDetailTable.on('click', 'tbody tr', { passive: true }, function () {

    // Capturar la fila seleccionada para el detalle de cada orden
    const dataOrd = addDetailTable.DataTable().row(this).data();
    console.log("detalles de ordenes")
    console.log(dataOrd);
    console.log("La orden " + dataOrd.OrdNbr + " solo recibe productos con el iD: " + dataLotSerNbr.InvtID);

    // Declarar variables locales
    const buttonAddSerials = $("#botonAnhadirSerial");
    const serialInput = $("#add-producto");
    const addSerialsInfo = $("#add-serials-info");

    // Crear un arreglo vacío para almacenar los seriales ingresados
    var LotSerList = [];
    const serialesIngresados = [];
    console.log(LotSerList);
    // Mostrar el modal de detalle
    detailModal.modal('show');

    // Enfocar el input de seriales
    detailModal.on('shown.bs.modal', () => {
      serialInput.focus();
    });

    // Desasociar el evento click del botón buttonAddSerials
    buttonAddSerials.off('click');
    serialInput.off('keypress');

    // Agregar seriales al hacer clic en el botón "Agregar"
    buttonAddSerials.on('click', () => {
      agregarSerial();
    });

    serialInput.on('keypress', e => {
      if (e.keyCode === 13) {
        agregarSerial();
      }
    });

    // Función para agregar un serial a la tabla y al arreglo
    const agregarSerial = () => {

      const serial = serialInput.val(); // Agregar el serial en la variable serial
      console.log('Serial ingresado:', serial);
      const countLotserNbr = serial.match(/[a-zA-Z]/g);
      const cantidadLetras = countLotserNbr ? countLotserNbr.length : 0;

      if (serial.length === 12 || serial.length === 13) { // Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

        if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
          addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
          serialInput.val('');
          return; // Salir de la función para evitar agregar el serial repetido
        }

        $.ajax({
          url: '{% url "addSerialsDetail" %}',
          data: { getLotSerNbr: serial },
          dataType: 'json',
          success: response => {

            if (response.data.length > 0 && (cantidadLetras === 2 || cantidadLetras === 3)) {

              const nuevosElementos = response.data.filter(item => item.InvtID === dataLotSerNbr.InvtID);

              if (nuevosElementos.some(item => item.STATUS === 'D')) {
                addSerialsInfo.text(`¡EL Serial ${serial} Se Encuentra Despachado!`);
                serialInput.val('');
                serialInput.focus();
                return;
              } else if (nuevosElementos.some(item => item.STATUS === 'P')) {
                addSerialsInfo.text(`¡EL Serial ${serial} Se Encuentra Pendiente!`);
                serialInput.val('');
                serialInput.focus();
                return;
              } else if (nuevosElementos.length === 0) {
                addSerialsInfo.text(`¡Este Serial No Es Un Producto ${dataLotSerNbr.Descr}!`);
                serialInput.val('');
                serialInput.focus();
                return; // Salir de la función para evitar agregar elementos que no cumplen con la condición
              }

              serialTable.DataTable().rows.add(nuevosElementos).draw();

              LotSerList = LotSerList.concat(nuevosElementos);
              console.log(LotSerList);
              console.log("la candiadad de letras es: " + cantidadLetras);
              serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados

              const todosIguales = LotSerList.every(item => item.InvtID === LotSerList[0].InvtID);
              if (todosIguales) {
                console.log(`Todos los elementos en el array tienen el mismo valor de InvtID: ${LotSerList[0].InvtID}`);
              } else {
                console.log('Los elementos en el array tienen diferentes valores de InvtID');
              }

              addSerialsInfo.text('');
              serialInput.val('');
              serialInput.focus();
            } else {
              addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
              serialInput.val('');
              serialInput.focus();
            }
          },
          error: () => {
            addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
            serialInput.val('');
            serialInput.focus();
          }
        });

      }
      else {
        if (serial === '') {
          addSerialsInfo.text('¡No Se Permite Campos Vacios!, Ingrese Un Serial!!');
          serialInput.val('');
          serialInput.focus();
        } else {
          addSerialsInfo.text('¡Serial Invalido!, Vuelva a Intentarlo.');
          serialInput.val('');
          serialInput.focus();
        }
      }
    };

    // Evento para mostrar la alerta de eliminación al hacer clic en el botón
    $('#alert_demo_8').click(function (e) {
      e.preventDefault();
      showDeleteConfirmationModal();
    });

    // Evento para mostrar la alerta de eliminación al hacer clic fuera del modal
    $(document).click(function (event) {
      var target = $(event.target);
      if (target.is(detailModal) && detailModal.is(':visible')) {
        if ($.fn.DataTable.isDataTable(serialTable)) {
          var tablaDatos = serialTable.DataTable().data();
          if (tablaDatos.any()) {
            showDeleteConfirmationModal();
          } else {
            detailModal.modal('hide');
          }
        }
      }
    });

    // Función para mostrar la alerta de eliminación
    function showDeleteConfirmationModal() {
      swal({
        title: '¿Deseas Eliminar Los Seriales Seleccionados?',
        text: "No podrás revertir esto.!",
        icon: 'warning',
        buttons: {
          cancel: {
            visible: true,
            text: 'No, Cancelar!',
            className: 'btn btn-danger'
          },
          confirm: {
            text: 'Sí, Eliminar!',
            className: 'btn btn-success'
          }
        }
      }).then((willDelete) => {
        if (willDelete) {
          const tablaDatos = serialTable.DataTable().data();
          if (tablaDatos.any()) {
            LotSerList = [];
            //serialesIngresados = [];
            serialTable.DataTable().clear().draw();
            detailModal.modal('hide');
            console.log("Seriales Eliminados: ");
            console.log(LotSerList);
            swal("¡Has Eliminado Los Seriales Con Éxito!", {
              icon: "success",
              buttons: {
                confirm: {
                  className: 'btn btn-success'
                }
              }
            });
          } else {
            swal("¡No Se Ha Cargado Ningun Serial Para Eliminar!", {
              icon: "warning",
              buttons: {
                confirm: {
                  className: 'btn btn-success'
                }
              }
            });
          }
        } else {
          console.log("Seriales Salvados: ");
          console.log(LotSerList);
          swal("¡Tus Seriales Han Sido Salvados!", {
            buttons: {
              confirm: {
                className: 'btn btn-success'
              }
            }
          });
          detailModal.modal('show');
        }
      });
    }
  });


  $.ajax({
    type: "GET",
    url: "{% url 'prefixSerialsVa' %}",
    dataType: "json",
    success: function (response) {
      const dataPrefix = response.dataPrefix;
      console.log(dataPrefix);
      // Realiza las validaciones necesarias con los datos obtenidos.
    },
    error: function (xhr, status, error) {
      console.log(error);
    }
  });

});



//////////////////////

// Función para mostrar la alerta de eliminación
function showDeleteConfirmationModal() {
  swal({
    title: '¿Deseas Eliminar Los Seriales Seleccionados?',
    text: "No podrás revertir esto.!",
    icon: 'warning',
    buttons: {
      cancel: {
        visible: true,
        text: 'No, Cancelar!',
        className: 'btn btn-danger'
      },
      confirm: {
        text: 'Sí, Eliminar!',
        className: 'btn btn-success'
      }
    }
  }).then((willDelete) => {
    if (willDelete) {
      const tablaDatos = serialTable.DataTable();
      const filasSeleccionadas = tablaDatos.rows('.selected').data();
      if (filasSeleccionadas.any()) {
        LotSerList = [];
        filasSeleccionadas.each(function (data, index) {
          LotSerList.push(data.LOTSERNBR);
        });
        tablaDatos.rows('.selected').remove().draw(false);
        detailModal.modal('hide');
        console.log("Seriales Eliminados: ");
        console.log(LotSerList);
        swal("¡Has Eliminado Los Seriales Con Éxito!", {
          icon: "success",
          buttons: {
            confirm: {
              className: 'btn btn-success'
            }
          }
        });
      } else {
        swal("¡No Se Ha Seleccionado Ningún Serial Para Eliminar!", {
          icon: "warning",
          buttons: {
            confirm: {
              className: 'btn btn-success'
            }
          }
        });
      }
    } else {
      console.log("Seriales Salvados: ");
      console.log(LotSerList);
      swal("¡Tus Seriales Han Sido Salvados!", {
        buttons: {
          confirm: {
            className: 'btn btn-success'
          }
        }
      });
      detailModal.modal('show');
    }
  });
}