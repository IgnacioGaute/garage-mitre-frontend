export interface TicketError {
    code: string;
    message: string;
  }


  export function handleTicketError(error: TicketError): TicketError {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'Error desconocido.';
  
    switch (errorCode) {
      case 'TICKET_PRICE_TYPE_FOUND':
        error.message
        break;
        case 'TICKET_PRICE_NOT_FOUND':
          error.message
          break;
      default:
        errorMessage = error.message || 'Error desconocido.';
    }
  
    return {
      code: errorCode,
      message: errorMessage,
    };
  }