import { BoxList } from "@/types/box-list.type";

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
