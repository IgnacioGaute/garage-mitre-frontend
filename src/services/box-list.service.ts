import { OtherPaymentSchemaType } from "@/schemas/other-payment.schema";
import { BoxList } from "@/types/box-list.type";
import { OtherPayment } from "@/types/other-payment.type";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const findBoxByDate = async (date: Date) => {
  try {

    const response = await fetch(`${BASE_URL}/box-lists/date/${date}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`No se encontró BoxList para la fecha: ${date}`);
      return null;
    }

    const data = await response.json();

    // Si la respuesta está vacía o el backend devuelve un objeto vacío, manejarlo
    if (!data || Object.keys(data).length === 0) {
      console.warn(`No hay datos disponibles para la fecha: ${date}`);
      return null;
    }

    return data as BoxList;
  } catch (error) {
    // Verificar si el error es una instancia de Error antes de acceder a message
    if (error instanceof Error) {
      console.error(`Error al obtener BoxList: ${error.message}`);
    } else {
      console.error("Error desconocido al obtener BoxList", error);
    }
    return null;
  }
};

export const createOtherPayment = async (
    values: OtherPaymentSchemaType
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/box-lists/otherPayment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(values),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        return data as OtherPayment;
      } else {
        console.error('Error en la respuesta:', data);
        return null;
      }
    } catch (error) {
      console.error('Error en create pago:', error);
      return null;
    }
  };
