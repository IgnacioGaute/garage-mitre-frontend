import { getTicketRegistrations } from "@/services/tickets.service";
import CardTicket from "./components/ticket.card";
import ScannerButton from "./components/scanner-button"; // Importamos el botón

export default async function TicketPage() {
  const registrations = await getTicketRegistrations();

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="container mx-auto px-4">
        {/* 🔥 Botón para iniciar el escáner */}
        <ScannerButton />

        {/* 📌 Lista de registros */}
        <CardTicket registrations={registrations} />
      </div>
    </div>
  );
}

