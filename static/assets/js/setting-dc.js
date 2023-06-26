$(document).ready(() => {
  //Objetos Jquery que hacen referencia a un elemento HTML mediante su selector
  const manifiestoModal = $("#manifiesto-modal");
  const manifiestoTable = $("#manifiesto-table");
  const tablaSeriales = $("#tabla-seriales");
  const addDetailTable = $("#detail-table");
  const detailModal = $("#add-serials-modal");
  // Obtener el campo de entrada para los siguientes campos (Encabezado)
  const frtTermsIdInput = $("#frt-terms-id");
  const descInput = $("#desc-id");
  const fechaInput = $("#fecha-id");
  const estadoInput = $("#estado-id");
  const camionInput = $("#camion-id");

  //Objeto DOM que hace referencia a un elemento HTML mediante su ID.
  const closeButton = document.getElementById("close-modal-serials"); // Obtener el botón "Cerrar"

  let frtTermsID; // Definir una variable global para almacenar el valor de FrtTermsID

  // Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
  const tableManifest = manifiestoTable.DataTable({
    order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
    ajax: {
      type: 'GET',
      url: "{% url 'getManifestList' %}",
      dataSrc: "dataManifest",
    },
    columnDefs: [
      {
        sortable: false,
        orderable: false,
        targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
        className: 'select-checkbox'
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

    // Obtener los datos de la fila seleccionada
    const data = tableManifest.row(this).data();

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
        /* scrollY: "35vh", */
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
      },
    });
  });

  tablaSeriales.on("click", "tbody tr", { passive: true }, function () {

    //Condicion para reinicializar la detalles del producto(#detail-table)
    if ($.fn.DataTable.isDataTable(addDetailTable)) {
      addDetailTable.DataTable().destroy();
    }

    // Obtener los datos de la fila seleccionada
    const data = tablaSeriales.DataTable().row(this).data();

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
        Invt_ID: data["InvtID"], //valor obtenido de la vista getProductList
      },
      success: (data) => {
        addDetailTable.DataTable().clear().rows.add(data.data).draw();
      },
    });
  });

  /* const addDetailTable = $('#add-detail-table'); */

  serialTable = $("#add-serials-detail").DataTable({
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
  }).clear().draw();


  addDetailTable.on('click', 'tbody tr', { passive: true }, () => {
    detailModal.modal('show');

    let numCaracteres = 0;
    let timeoutId = null;

    const buttonAddSerials = $("#botonAnhadirSerial");
    const serialInput = $("#add-producto");
    const addSerialsInfo = $("#add-serials-info");

    serialInput.focus(); //no esta haciendo el enfoque del cursor

    // Crear un arreglo vacío para almacenar los seriales ingresados
    const serialesIngresados = [];

    const agregarSerial = () => {
      const serial = serialInput.val(); //Agrega el serial en la Variable serial

      if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

        if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
          addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
          serialInput.val('');
          return;  // Salir de la función para evitar agregar el serial repetido
        }
        $.ajax({
          url: '{% url "addSerialsDetail" %}',
          data: { getLotSerNbr: serial },
          dataType: 'json',
          success: response => {
            if (response.data.length > 0) {
              serialTable.rows.add(response.data).draw();
              serialInput.val('');
              addSerialsInfo.text('');
              serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
              serialInput.focus();
            }
            else {
              addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
              serialInput.val('');
              serialInput.focus();
            }
          },
          error: () => {
            addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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

    buttonAddSerials.click(agregarSerial);

    serialInput.on('keyup', e => {
      if (e.keyCode === 13) {
        agregarSerial();
      }
    });

    serialInput.on('keyup', () => {
      const serial = serialInput.val();
      numCaracteres = serial.length;

      if (numCaracteres === 12) {
        timeoutId = setTimeout(() => {
          agregarSerial();
        }, 200);
      } else if (numCaracteres === 13) {
        clearTimeout(timeoutId);
        agregarSerial();
      }
    });

    closeButton.addEventListener("click", () => {
      detailModal.modal('hide');
    });
  });
});

/* addDetailTable.on('click', 'tbody tr', { passive: true }, () => {
    detailModal.modal('show');

    const buttonAddSerials = $("#botonAnhadirSerial");
    const serialInput = $("#add-producto");
    const addSerialsInfo = $("#add-serials-info");

    serialInput.focus();

    const serialesIngresados = [];

    serialInput.on('keyup', () => {
      const serial = serialInput.val();

      if (serial.length === 12) {
        if (serialesIngresados.includes(serial)) {
          addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
          serialInput.val('');
          return;
        }

        $.ajax({
          url: '{% url "addSerialsDetail" %}',
          data: { getLotSerNbr: serial },
          dataType: 'json',
          success: response => {
            if (response.data.length > 0) {
              serialTable.rows.add(response.data).draw();
              addSerialsInfo.text('');
              serialesIngresados.push(serial);
              serialInput.val('').focus();
            } else {
              addSerialsInfo.text('¡Serial Invalido!, Vuelva a Intentarlo.');
              serialInput.val('').focus();
            }
          },
          error: () => {
            addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
          }
        });
      }
    });
  }); */
/* addDetailTable.on('click', 'tbody tr', { passive: true }, () => {
  detailModal.modal('show');

  const buttonAddSerials = $("#botonAnhadirSerial");
  const serialInput = $("#add-producto");
  const addSerialsInfo = $("#add-serials-info");

  serialInput.focus();

  const serialesIngresados = [];

  const serial = serialInput.val();

  if (serial.length === 12) {
    const serial = serialInput.val();

    if (serial.length !== 12 && serial.length !== 13) {
      addSerialsInfo.text('Ingrese Un Serial Válido.');
      return;
    }

    if (serialesIngresados.includes(serial)) {
      addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
      serialInput.val('');
      return;
    }

    $.ajax({
      url: '{% url "addSerialsDetail" %}',
      data: { getLotSerNbr: serial },
      dataType: 'json',
      success: response => {
        if (response.data.length > 0) {
          serialTable.rows.add(response.data).draw();
          addSerialsInfo.text('');
          serialesIngresados.push(serial);
          serialInput.val('').focus();
        } else {
          addSerialsInfo.text('¡Serial Invalido!, Vuelva a Intentarlo.');
          serialInput.val('').focus();
        }
      },
      error: () => {
        addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
      }
    });
  }
}); */




























/* 
    $(document).ready(() => {
      //Objetos Jquery que hacen referencia a un elemento HTML mediante su selector
      const manifiestoModal = $("#manifiesto-modal");
      const manifiestoTable = $("#manifiesto-table");
      const tablaSeriales = $("#tabla-seriales");
      const addDetailTable = $("#detail-table");
      const detailModal = $("#add-serials-modal");
      // Obtener el campo de entrada para los siguientes campos (Encabezado)
      const frtTermsIdInput = $("#frt-terms-id");
      const descInput = $("#desc-id");
      const fechaInput = $("#fecha-id");
      const estadoInput = $("#estado-id");
      const camionInput = $("#camion-id");
  
      //Objeto DOM que hace referencia a un elemento HTML mediante su ID.
      const closeButton = document.getElementById("close-modal-serials"); // Obtener el botón "Cerrar"
  
      let frtTermsID; // Definir una variable global para almacenar el valor de FrtTermsID
  
      // Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
      const tableManifest = manifiestoTable.DataTable({
        order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
        ajax: {
          type: 'GET',
          url: "{% url 'getManifestList' %}",
          dataSrc: "dataManifest",
        },
        columnDefs: [
          {
            sortable: false,
            orderable: false,
            targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
            className: 'select-checkbox'
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
  
        //CAPTURANDO LA FILA SELECCIONADA PARA EL DETALLE DE CADA ORDEN
        const data = tableManifest.row(this).data();
        console.log("detalles del manifiesto");
        console.log(data);
  
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
          },
        });
      });
  
      tablaSeriales.on("click", "tbody tr", { passive: true }, function () {
  
        //Condicion para reinicializar la detalles del producto(#detail-table)
        if ($.fn.DataTable.isDataTable(addDetailTable)) {
          addDetailTable.DataTable().destroy();
        }
  
        // Obtener los datos de la fila seleccionada
        const data = tablaSeriales.DataTable().row(this).data();
        console.log("detalles de los productos");
        console.log(data);
  
        
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
            Invt_ID: data["InvtID"], //valor obtenido de la vista getProductList
          },
          success: (data) => {
            addDetailTable.DataTable().clear().rows.add(data.data).draw();
    
          },
        });
      });
  
  
      serialTable = $("#add-serials-detail").DataTable({
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
      }).clear().draw();
  
  
      addDetailTable.on('click', 'tbody tr', { passive: true }, function () {
        //CAPTURANDO LA FILA SELECCIONADA PARA EL DETALLE DE CADA ORDEN
        const dataOrd = addDetailTable.DataTable().row(this).data();
        console.log("detalles de ordenes")
        console.log(dataOrd);
  
        detailModal.modal('show');
  
        let numCaracteres = 0;
        let timeoutId = null;
  
        const buttonAddSerials = $("#botonAnhadirSerial");
        const serialInput = $("#add-producto");
        const addSerialsInfo = $("#add-serials-info");
  
        serialInput.focus(); //no esta haciendo el enfoque del cursor
  
        // Crear un arreglo vacío para almacenar los seriales ingresados
        const serialesIngresados = [];
  
        const agregarSerial = () => {
          const serial = serialInput.val(); //Agrega el serial en la Variable serial
  
          if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres
  
            if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
              addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
              serialInput.val('');
              return;  // Salir de la función para evitar agregar el serial repetido
            }
            $.ajax({
              url: '{% url "addSerialsDetail" %}',
              data: { getLotSerNbr: serial },
              dataType: 'json',
              success: response => {
                if (response.data.length > 0) {
                  serialTable.rows.add(response.data).draw();
                  serialInput.val('');
                  addSerialsInfo.text('');
                  serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
                  serialInput.focus();
                }
                else {
                  addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
                  serialInput.val('');
                  serialInput.focus();
                }
              },
              error: () => {
                addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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
  
        buttonAddSerials.click(agregarSerial);
  
        serialInput.on('keyup', e => {
          if (e.keyCode === 13) {
            agregarSerial();
          }
        });
  
        serialInput.on('keyup', () => {
          const serial = serialInput.val();
          numCaracteres = serial.length;
  
          if (numCaracteres === 12) {
            timeoutId = setTimeout(() => {
              agregarSerial();
            }, 200);
          } else if (numCaracteres === 13) {
            clearTimeout(timeoutId);
            agregarSerial();
          }
        });
  
        closeButton.addEventListener("click", () => {
          detailModal.modal('hide');
        });
      });
    }); */

LotSerList = [];
$.ajax({
  url: '{% url "addSerialsDetail" %}',
  data: { getLotSerNbr: serial },
  dataType: 'json',
  success: response => {
    if (response.data.length > 0) {
      serialTable.rows.add(response.data).draw();

      serialInput.val('');
      addSerialsInfo.text('');
      serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
      serialInput.focus();

      LotSerList = LotSerList.concat(response.data); // Unir la lista de objetos a pp

      let encontrado = false;
      for (let i = 0; i < LotSerList.length; i++) {
        if (LotSerList[i].InvtID === dataLotSerNbr.InvtID) {
          encontrado = true;
          break;
        }
      }
      if (encontrado) {
        console.log(`El valor de InvtID en algún objeto es igual a ${dataLotSerNbr.InvtID}`);
      } else {
        console.log(`Ningún objeto tiene el valor de InvtID igual a ${dataLotSerNbr.InvtID}`);
      }
    }
  },
});



/////////////////////// ultima version ///////////////////////////


$(document).ready(() => {
  //Objetos Jquery que hacen referencia a un elemento HTML mediante su selector
  const manifiestoModal = $("#manifiesto-modal");
  const manifiestoTable = $("#manifiesto-table");
  const tablaSeriales = $("#tabla-seriales");
  const addDetailTable = $("#detail-table");
  const detailModal = $("#add-serials-modal");
  // Obtener el campo de entrada para los siguientes campos (Encabezado)
  const frtTermsIdInput = $("#frt-terms-id");
  const descInput = $("#desc-id");
  const fechaInput = $("#fecha-id");
  const estadoInput = $("#estado-id");
  const camionInput = $("#camion-id");

  //Objeto DOM que hace referencia a un elemento HTML mediante su ID.
  const closeButton = document.getElementById("close-modal-serials"); // Obtener el botón "Cerrar"

  let frtTermsID; // Definir una variable global para almacenar el valor de FrtTermsID

  // Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
  const tableManifest = manifiestoTable.DataTable({
    order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
    ajax: {
      type: 'GET',
      url: "{% url 'getManifestList' %}",
      dataSrc: "dataManifest",
    },
    columnDefs: [
      {
        sortable: false,
        orderable: false,
        targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
        className: 'select-checkbox'
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
        /* for (let index = 0; index < se.length; index++) {
        const element = se[index];
        console.log(element);
        } */

      },
    });
  });





  addDetailTable.on('click', 'tbody tr', { passive: true }, function () {
    //CAPTURANDO LA FILA SELECCIONADA PARA EL DETALLE DE CADA ORDEN
    const dataOrd = addDetailTable.DataTable().row(this).data();
    console.log("detalles de ordenes")
    console.log(dataOrd);
    console.log("La orden " + dataOrd.OrdNbr + " solo recibe productos con el iD: " + dataLotSerNbr.InvtID);


    detailModal.modal('show');

    let numCaracteres = 0;
    let timeoutId = null;

    const buttonAddSerials = $("#botonAnhadirSerial");
    const serialInput = $("#add-producto");
    const addSerialsInfo = $("#add-serials-info");

    serialInput.focus(); //no esta haciendo el enfoque del cursor

    LotSerList = [];

    // Crear un arreglo vacío para almacenar los seriales ingresados
    const serialesIngresados = [];

    const agregarSerial = () => {
      const serial = serialInput.val(); //Agrega el serial en la Variable serial

      if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

        if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
          addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
          serialInput.val('');
          return;  // Salir de la función para evitar agregar el serial repetido
        }
        $.ajax({
          url: '{% url "addSerialsDetail" %}',
          data: { getLotSerNbr: serial },
          dataType: 'json',
          success: response => {
            /* console.log(response); */
            if (response.data.length > 0) {
              /* if(dataLotSerNbr.InvtID === ) */
              serialTable.rows.add(response.data).draw();

              serialInput.val('');
              addSerialsInfo.text('');
              serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
              serialInput.focus();
              /*  */
              /* const countLotserNbr = serial.match(/[a-zA-Z]/g);
              const cantidadLetras = countLotserNbr  ? countLotserNbr.length : 0;
              if (cantidadLetras == 2) {
                console.log(countLotserNbr);
                console.log("la candiadad de letras es: "+cantidadLetras);
              }else{
                if (cantidadLetras == 3) {
                  console.log(countLotserNbr);
                  console.log("la candiadad de letras es: "+cantidadLetras);
                }
              } */
              LotSerList = LotSerList.concat(response.data); // Unir la lista de objetos a pp

              let encontrado = false;
              for (let i = 0; i < LotSerList.length; i++) {
                if (LotSerList[i].InvtID == dataLotSerNbr.InvtID) {
                  console.log(LotSerList[i].InvtID);
                  encontrado = true;
                  break;
                }
              }
              if (encontrado) {
                console.log(`El valor de InvtID en algún objeto es igual a ${dataLotSerNbr.InvtID}`);
              } else {
                console.log(`Ningún objeto tiene el valor de InvtID igual a ${dataLotSerNbr.InvtID}`);
              }

              /*  console.log(LotSerList[0].InvtID); */
              console.log(LotSerList);

            }
            else {
              addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
              serialInput.val('');
              serialInput.focus();
            }
          },
          error: () => {
            addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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

    buttonAddSerials.click(agregarSerial);

    serialInput.on('keyup', e => {
      if (e.keyCode === 13) {
        agregarSerial();
      }
    });

    serialInput.on('keyup', () => {
      const serial = serialInput.val();
      numCaracteres = serial.length;

      if (numCaracteres === 12) {
        timeoutId = setTimeout(() => {
          agregarSerial();
        }, 200);
      } else if (numCaracteres === 13) {
        clearTimeout(timeoutId);
        agregarSerial();
      }
    });

    closeButton.addEventListener("click", () => {
      detailModal.modal('hide');
    });
  });

  serialTable = $("#add-serials-detail").DataTable({
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
  }).clear().draw();
});


///////////////////////////////////

$(document).ready(() => {
  //Objetos Jquery que hacen referencia a un elemento HTML mediante su selector
  const manifiestoModal = $("#manifiesto-modal");
  const manifiestoTable = $("#manifiesto-table");
  const tablaSeriales = $("#tabla-seriales");
  const addDetailTable = $("#detail-table");
  const detailModal = $("#add-serials-modal");
  // Obtener el campo de entrada para los siguientes campos (Encabezado)
  const frtTermsIdInput = $("#frt-terms-id");
  const descInput = $("#desc-id");
  const fechaInput = $("#fecha-id");
  const estadoInput = $("#estado-id");
  const camionInput = $("#camion-id");

  //Objeto DOM que hace referencia a un elemento HTML mediante su ID.
  const closeButton = document.getElementById("close-modal-serials"); // Obtener el botón "Cerrar"

  let frtTermsID; // Definir una variable global para almacenar el valor de FrtTermsID

  // Cargar los datos de la lista de manifiestos en una tabla utilizando la API de DataTables
  const tableManifest = manifiestoTable.DataTable({
    order: [[2, "desc"]], //ordena de forma descendente la columna de la fecha[2]
    ajax: {
      type: 'GET',
      url: "{% url 'getManifestList' %}",
      dataSrc: "dataManifest",
    },
    columnDefs: [
      {
        sortable: false,
        orderable: false,
        targets: [0, 1, 3, 4], //desactiva las columnas que no se van a ordenar
        className: 'select-checkbox'
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
        /* for (let index = 0; index < se.length; index++) {
        const element = se[index];
        console.log(element);
        } */

      },
    });
  });





  addDetailTable.on('click', 'tbody tr', { passive: true }, function () {
    //CAPTURANDO LA FILA SELECCIONADA PARA EL DETALLE DE CADA ORDEN
    const dataOrd = addDetailTable.DataTable().row(this).data();
    console.log("detalles de ordenes")
    console.log(dataOrd);
    console.log("La orden " + dataOrd.OrdNbr + " solo recibe productos con el iD: " + dataLotSerNbr.InvtID);


    detailModal.modal('show');

    let numCaracteres = 0;
    let timeoutId = null;

    const buttonAddSerials = $("#botonAnhadirSerial");
    const serialInput = $("#add-producto");
    const addSerialsInfo = $("#add-serials-info");

    serialInput.focus(); //no esta haciendo el enfoque del cursor

    LotSerList = [];

    // Crear un arreglo vacío para almacenar los seriales ingresados
    const serialesIngresados = [];

    const agregarSerial = () => {
      const serial = serialInput.val(); //Agrega el serial en la Variable serial

      if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

        if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
          addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
          serialInput.val('');
          return;  // Salir de la función para evitar agregar el serial repetido
        }
        $.ajax({
          url: '{% url "addSerialsDetail" %}',
          data: { getLotSerNbr: serial },
          dataType: 'json',
          success: response => {
            /* console.log(response); */
            if (response.data.length > 0) {
              /* if(dataLotSerNbr.InvtID === ) */
              serialTable.rows.add(response.data).draw();

              serialInput.val('');
              addSerialsInfo.text('');
              serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
              serialInput.focus();
              /*  */
              const countLotserNbr = serial.match(/[a-zA-Z]/g);
              const cantidadLetras = countLotserNbr ? countLotserNbr.length : 0;
              if (cantidadLetras == 2) {
                console.log(countLotserNbr);
                console.log("la candiadad de letras es: " + cantidadLetras);
              } else {
                if (cantidadLetras == 3) {
                  console.log(countLotserNbr);
                  console.log("la candiadad de letras es: " + cantidadLetras);
                }
              }


              LotSerList = LotSerList.concat(response.data); // Unir la lista de objetos a pp

              const encontrado = LotSerList.some(item => item.InvtID === dataLotSerNbr.InvtID);

              if (encontrado) {
                console.log(`El valor de InvtID en algún objeto es igual a ${dataLotSerNbr.InvtID}`);
                console.log(LotSerList[0].InvtID);
              } else {
                console.log(`Ningún objeto tiene el valor de InvtID igual a ${dataLotSerNbr.InvtID}`);
                LotSerList.push(dataLotSerNbr);
              }

              console.log(LotSerList);

            }
            else {
              addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
              serialInput.val('');
              serialInput.focus();
            }
          },
          error: () => {
            addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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

    buttonAddSerials.click(agregarSerial);

    serialInput.on('keyup', e => {
      if (e.keyCode === 13) {
        agregarSerial();
      }
    });

    serialInput.on('keyup', () => {
      const serial = serialInput.val();
      numCaracteres = serial.length;

      if (numCaracteres === 12) {
        timeoutId = setTimeout(() => {
          agregarSerial();
        }, 200);
      } else if (numCaracteres === 13) {
        clearTimeout(timeoutId);
        agregarSerial();
      }
    });

    closeButton.addEventListener("click", () => {
      detailModal.modal('hide');
    });
  });

  serialTable = $("#add-serials-detail").DataTable({
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
  }).clear().draw();
});













//////////////////////////

let encontrado = false;
for (let i = 0; i < LotSerList.length; i++) {
  if (LotSerList[i].InvtID == dataLotSerNbr.InvtID) {
    console.log(LotSerList[i].InvtID);
    encontrado = true;
    break;
  }
}
if (encontrado) {
  console.log(`El valor de InvtID en algún objeto es igual a ${dataLotSerNbr.InvtID}`);
} else {
  console.log(`Ningún objeto tiene el valor de InvtID igual a ${dataLotSerNbr.InvtID}`);
}

/*  console.log(LotSerList[0].InvtID); */
console.log(LotSerList);


/////////////

LotSerList = [];

// Crear un arreglo vacío para almacenar los seriales ingresados
const serialesIngresados = [];

const agregarSerial = () => {
  const serial = serialInput.val(); //Agrega el serial en la Variable serial
  const countLotserNbr = serial.match(/[a-zA-Z]/g);
  const cantidadLetras = countLotserNbr ? countLotserNbr.length : 0;
  if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

    if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
      addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
      serialInput.val('');
      return;  // Salir de la función para evitar agregar el serial repetido
    }

    $.ajax({
      url: '{% url "addSerialsDetail" %}',
      data: { getLotSerNbr: serial },
      dataType: 'json',
      success: response => {

        if (response.data.length > 0 && cantidadLetras == 2) {

          const nuevosElementos = response.data.filter(item => item.InvtID === dataLotSerNbr.InvtID);
          if (nuevosElementos.length === 0) {
            addSerialsInfo.text(`¡Este Serial No Tiene El InvtID ${dataLotSerNbr.InvtID}!`);
            serialInput.val('');
            serialInput.focus();
            return; // Salir de la función para evitar agregar elementos que no cumplen con la condición
          }

          serialTable.rows.add(nuevosElementos).draw();
          LotSerList = LotSerList.concat(nuevosElementos);

          const todosIguales = LotSerList.every(item => item.InvtID === LotSerList[0].InvtID);
          if (todosIguales) {
            console.log(`Todos los elementos en el array tienen el mismo valor de InvtID: ${LotSerList[0].InvtID}`);
          } else {
            console.log('No todos los elementos en el array tienen el mismo valor de InvtID');
          }

          serialInput.val('');
          addSerialsInfo.text('');
          serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
          serialInput.focus();

          console.log(LotSerList);
          console.log("la candiadad de letras es: " + cantidadLetras);

        } else if (response.data.length > 0 && cantidadLetras == 3) {
          console.log("la candiadad de letras es: " + cantidadLetras);
        }
        else {
          addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
          serialInput.val('');
          serialInput.focus();
        }
      },

      error: () => {
        addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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


//////////////

LotSerList = [];

// Crear un arreglo vacío para almacenar los seriales ingresados
const serialesIngresados = [];

const agregarSerial = () => {
  const serial = serialInput.val(); //Agrega el serial en la Variable serial
  const countLotserNbr = serial.match(/[a-zA-Z]/g);
  const cantidadLetras = countLotserNbr ? countLotserNbr.length : 0;
  if (serial.length === 12 || serial.length === 13) { //Verificar que la cadena de caracteres sea entre igual a 12 o 13 caracteres

    if (serialesIngresados.includes(serial)) { // Verificar si el serial ya ha sido ingresado
      addSerialsInfo.text('¡Este Serial Ha Sido Cargado!');
      serialInput.val('');
      return;  // Salir de la función para evitar agregar el serial repetido
    }

    $.ajax({
      url: '{% url "addSerialsDetail" %}',
      data: { getLotSerNbr: serial },
      dataType: 'json',
      success: response => {

        if (response.data.length > 0 && (cantidadLetras === 2 || cantidadLetras === 3)) {

          const nuevosElementos = response.data.filter(item => item.InvtID === dataLotSerNbr.InvtID);
          if (nuevosElementos.length === 0) {
            addSerialsInfo.text(`¡Este Serial No Tiene El InvtID ${dataLotSerNbr.InvtID}!`);
            serialInput.val('');
            serialInput.focus();
            return; // Salir de la función para evitar agregar elementos que no cumplen con la condición
          }

          if (cantidadLetras === 3) {
            const elementosInvalidos = nuevosElementos.filter(item => item.LotSerNbr.substring(0, 2) !== serial.substring(0, 2));
            if (elementosInvalidos.length > 0) {
              addSerialsInfo.text(`¡Este Serial No Tiene El Prefijo ${serial.substring(0, 2)}!`);
              serialInput.val('');
              serialInput.focus();
              return; // Salir de la función para evitar agregar elementos que no cumplen con la condición
            }
          }

          serialTable.rows.add(nuevosElementos).draw();
          LotSerList = LotSerList.concat(nuevosElementos);

          const todosIguales = LotSerList.every(item => item.InvtID === LotSerList[0].InvtID);
          if (todosIguales) {
            console.log(`Todos los elementos en el array tienen el mismo valor de InvtID: ${LotSerList[0].InvtID}`);
          } else {
            console.log('No todos los elementos en el array tienen el mismo valor de InvtID');
          }

          serialInput.val('');
          addSerialsInfo.text('');
          serialesIngresados.push(serial); // Agregar el serial al arreglo de seriales ingresados
          serialInput.focus();

          console.log(LotSerList);
          console.log("la candiadad de letras es: " + cantidadLetras);

        }
        else {
          addSerialsInfo.text('¡Este Serial No Se Ha Creado!');
          serialInput.val('');
          serialInput.focus();
        }
      },

      error: () => {
        addSerialsInfo.text('Hubo un error al obtener los detalles del serial.');
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