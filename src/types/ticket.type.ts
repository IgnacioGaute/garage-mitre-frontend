import { TicketRegistration } from "./ticket-registration.type";

export const TICKET_TYPE = ['AUTO', 'CAMIONETA', 'MOTO'] as const;
export type TicketType = (typeof TICKET_TYPE)[number];

export type Ticket ={
    id: string;
    codeBar: string;
    amount: number;
    vehicleType: TicketType;
    ticketRegistration: TicketRegistration;
}

export type Scanner ={
    codeBar: string;
}