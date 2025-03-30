export interface ReceiptError {
    code: string;
    message: string;
  }


  export function handleReceiptError(error: ReceiptError): ReceiptError {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    let errorMessage = error.message || 'Error desconocido.';
  
    switch (errorCode) {
      case 'RECEIPT_PAID_NOT_FOUND':
        errorMessage =
          'El cliente no tiene un recibo pagado anteriormente.';
        break;
        case 'RECEIPT_PAID':
          errorMessage =
            'El cliente ya pago este mes.';
          break;
      default:
        errorMessage = error.message || 'Error desconocido.';
    }
  
    return {
      code: errorCode,
      message: errorMessage,
    };
  }