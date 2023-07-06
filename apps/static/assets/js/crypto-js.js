$('#alert_demo_8').click(function (e) {
  e.preventDefault();
  showDeleteConfirmationModal();
});

// Evento para mostrar la alerta de eliminación al hacer clic fuera del modal
$(document).click(function (event) {
  var target = $(event.target);
  if (target.is(detailModal) && detailModal.is(':visible')) {
    showDeleteConfirmationModal();
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