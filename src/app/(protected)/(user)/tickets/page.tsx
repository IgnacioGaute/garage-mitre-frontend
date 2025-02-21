"use client";

import { useState, useEffect } from "react";
import { getTicketRegistrations } from "@/services/tickets.service";
import CardTicket from "./components/ticket.card";
import ScannerButton from "./components/scanner-button";
import { TicketRegistration } from "@/types/ticket-registration.type";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_HOST_URL); // Asegúrate de tener la URL del servidor

export default function TicketPage() {
  const [registrations, setRegistrations] = useState<TicketRegistration[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchRegistrations() {
      const data: TicketRegistration[] = await getTicketRegistrations();
      setRegistrations(data);
    }

    fetchRegistrations();

    // Escuchar nuevos registros en tiempo real
    socket.on("new-registration", (newRegistration: TicketRegistration) => {
      setRegistrations((prev) => [newRegistration, ...prev]); // Agregar el nuevo registro al inicio
    });

    return () => {
      socket.off("new-registration"); // Limpiar el evento cuando se desmonta el componente
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="container mx-auto px-4">
        <ScannerButton isDialogOpen={isDialogOpen} />
        {/* Pasamos `setRegistrations` a CardTicket para que pueda actualizar los datos en tiempo real */}
        <CardTicket registrations={registrations} setIsDialogOpen={setIsDialogOpen} />
      </div>
    </div>
  );
}
