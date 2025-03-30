export interface CustomerError {
    code: string;
    message: string;
  }


  export function handleCustomerError(error: CustomerError): CustomerError {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'Error desconocido.';
  
    switch (errorCode) {
      case 'PARKING_TYPE_NOT_FOUND':
        errorMessage =
          'El tipo de estacionamiento no existe, necesita ser creado en Administrar para ser utilizado.';
        break;
      default:
        errorMessage = error.message || 'Error desconocido.';
    }
  
    return {
      code: errorCode,
      message: errorMessage,
    };
  }