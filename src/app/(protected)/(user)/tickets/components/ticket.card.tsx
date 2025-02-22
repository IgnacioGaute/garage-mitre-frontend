"use client";

import { useEffect, useState } from "react";
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
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_HOST_URL);

export default function CardTicket({
  initialRegistrations,
}: {
  initialRegistrations: TicketRegistration[];
}) {
  const [registrations, setRegistrations] = useState<TicketRegistration[]>(initialRegistrations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    socket.on("new-registration", (newRegistration: TicketRegistration) => {
      setRegistrations((prev) => [newRegistration, ...prev]);
    });

    return () => {
      socket.off("new-registration");
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
