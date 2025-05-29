import { PayloadActionMessage } from "src/app/shared/service/alerts/sweetalert/interfaces/action-message.interface";

export const ERROR_MESSAGE: PayloadActionMessage = {
    allowOutsideClick: true,
    icon: "error",
    showCancelButton: true,
    title: "Validación fallida",
    text: "Superó el número de intentos de validación. Por favor, inténtelo de nuevo más tarde.",
    confirmButtonText: "Aceptar"
  };