import { ScannerSchemaType } from "@/schemas/ticket-registration.schema";
import { Scanner } from "@/types/ticket.type";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ScannerResponse = Scanner | { error: string };

export const startScanner = async (values: { barCode: string }) => {
  try {
    console.log("Enviando petición a la API:", values);

    const response = await fetch(`${BASE_URL}/scanner/start-scanner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    console.log("Estado de la respuesta:", response.status, response.statusText);

    if (!response.ok) {
      console.error("Respuesta no OK:", response);
      return { error: `Error en la solicitud: ${response.statusText}` };
    }

    const data = await response.json();
    console.log("Respuesta de la API (después de .json()):", data);

    if (data.success === false) {
      return { error: data.message || "Error desconocido en el scanner" };
    }

    return data as Scanner;
  } catch (error) {
    console.error("Error en Scanner:", error);
    return { error: "Error de conexión con el servidor" };
  }
};


