"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketRegistration } from "@/types/ticket-registration.type";
import { CreateTicketRegistrationDialog } from "./create-ticket-registration-for-day-dialog";
import ScannerButton from "./scanner-button";

export default function CardTicket({
  initialRegistrations,
}: {
  initialRegistrations: TicketRegistration[];
}) {
  const [registrations, setRegistrations] = useState<TicketRegistration[]>(initialRegistrations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {

    const handleNewScan = async () => {
      router.refresh(); 
    };

    document.addEventListener("scan-success", handleNewScan);

    return () => {
      document.removeEventListener("scan-success", handleNewScan);
    };
  }, []);

  const latestRegistration = registrations.length > 0 ? registrations[0] : null;

  const formatDate = (date: Date | null): string =>
    date ? new Date(date).toLocaleDateString("es-AR") : "Sin fecha";

  return (
    <>
      <ScannerButton isDialogOpen={isDialogOpen} />

      <Card className="w-200 max-w-md mx-auto mt-8 p-5">
        <CardHeader>
          <CardTitle>Registro de Tickets</CardTitle>
          <CardDescription>Escanea el código de barras y registra un ticket por hora</CardDescription>
        </CardHeader>

        {latestRegistration ? (
          latestRegistration.ticket?.vehicleType ? (
            <CardContent>
              <p className="p-3"><strong>Descripción:</strong> {latestRegistration.description}</p>
              <p className="p-3"><strong>Día de entrada:</strong> {formatDate(latestRegistration.entryDay)}</p>
              <p className="p-3"><strong>Horario de entrada:</strong> {latestRegistration.entryTime}</p>
              <p className="p-3">
                <strong>
                {latestRegistration.ticket.price === latestRegistration.ticket.dayPrice
                  ? "Tipo de ticket: Día"
                  : "Tipo de ticket: Noche"}
                </strong>
                </p>
            </CardContent>
          ) : (
            <CardContent>
              <p className="p-3"><strong>Precio:</strong> ${latestRegistration.price}</p>
              <p className="p-3"><strong>Día de salida:</strong> {formatDate(latestRegistration.departureDay)}</p>
              <p className="p-3"><strong>Horario de entrada:</strong> {latestRegistration.entryTime}</p>
              <p className="p-3"><strong>Horario de salida:</strong> {latestRegistration.departureTime}</p>
            </CardContent>
          )
        ) : (
          <CardContent>
            <div className="flex justify-center items-center">No hay registros disponibles.</div>
          </CardContent>
        )}
      </Card>

      <CreateTicketRegistrationDialog setIsDialogOpen={setIsDialogOpen} />
    </>
  );
}
