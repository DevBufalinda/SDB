

$('#alert_demo_8').click(function (e) {
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
    },
    content: {
      element: "input",
      attributes: {
        placeholder: "Ingresa la contraseña",
        type: "password",
      },
    },
  }).then((password) => {
    // Encriptamos la contraseña ingresada
    const key = 'QCN4021420002';
    const expectedPassword = 'U2FsdGVkX1+OeP6WJylL4G6f1yW4wzTbLXq3TIYi9D8=';
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();

    // Validamos la contraseña
    if (encryptedPassword === expectedPassword) {
      swal("¡Has Eliminado Los Seriales Con Éxito!", {
        icon: "success",
        buttons: {
          confirm: {
            className: 'btn btn-success'
          }
        }
      });
    } else {
      swal("¡Contraseña incorrecta!", {
        icon: "error",
        buttons: {
          confirm: {
            className: 'btn btn-success'
          }
        }
      });
    }
  });
});