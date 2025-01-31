"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { useEffect, useState } from 'react';
  import io from 'socket.io-client';
  import { TicketRegistration } from '@/types/ticket-registration.type';
  
  const socket = io(process.env.NEXT_PUBLIC_HOST_URL); // URL de tu servidor backend
  
  export default function CardTicket({ registrations }: { registrations: TicketRegistration[] }) {
    const [latestRegistration, setLatestRegistration] = useState<TicketRegistration | null>(
      registrations.length > 0 ? registrations[0] : null
    );
  
    useEffect(() => {
      // Escucha el evento "new-registration"
      socket.on('new-registration', (data: TicketRegistration) => {
        setLatestRegistration(data);
      });
  
      return () => {
        socket.off('new-registration'); // Limpia el listener al desmontar el componente
      };
    }, []);
  
    if (!latestRegistration) {
      return (
        <div className="flex justify-center items-center">
          No hay registros disponibles.
        </div>
      );
    }
  
    // Formatear las fechas
    const formatDate = (date: Date | null): string =>
      date ? new Date(date).toLocaleDateString('es-AR') : 'Sin fecha';
  
    return (
      <Card className="w-200 max-w-md mx-auto mt-8 p-5">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>Información del Registro</CardDescription>
        </CardHeader>
        {latestRegistration.ticket?.vehicleType ? (
          <CardContent>
            <p className="p-3">
              <strong>Descripción:</strong> {latestRegistration.description}
            </p>
            <p className="p-3">
              <strong>Dia de entrada:</strong> {formatDate(latestRegistration.entryDay)}
            </p>
            <p className="p-3">
              <strong>Horario de entrada:</strong> {latestRegistration.entryTime}
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <p className="p-3">
              <strong>Precio:</strong> ${latestRegistration.price}
            </p>
            <p className="p-3">
              <strong>Dia de salida:</strong> {formatDate(latestRegistration.departureDay)}
            </p>
            <p className="p-3">
              <strong>Horario de salida:</strong> {latestRegistration.departureTime}
            </p>
          </CardContent>
        )}
      </Card>
    );
  }
  