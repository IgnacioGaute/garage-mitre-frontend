import { ScannerSchemaType } from "@/schemas/ticket-registration.schema";
import { Scanner } from "@/types/ticket.type";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const startScanner = async (values: { barCode: string }) => {
  try {
    console.log("Enviando petición a la API:", values);

    const response = await fetch(`${BASE_URL}/scanner/start-scanner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      console.error("Respuesta no OK:", response);
      return { error: `Error en la solicitud: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.success === false) {
      return { error: data.message || "Error desconocido en el scanner" };
    }

    return data as Scanner;
  } catch (error) {
    console.error("Error en Scanner:", error);
    return { error: "Error de conexión con el servidor" };
  }
};


