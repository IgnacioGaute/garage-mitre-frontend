import { TicketRegistration } from "./ticket-registration.type";

export const TICKET_TYPE = ['AUTO', 'CAMIONETA'] as const;
export type TicketType = (typeof TICKET_TYPE)[number];

export type Ticket ={
    id: string;
    codeBar: string;
    price: number;
    dayPrice: number;
    nightPrice: number;
    vehicleType: TicketType;
    ticketRegistration: TicketRegistration;
}

export type Scanner ={
    codeBar: string;
    success: boolean;
    message?: string;
    type?: 'RECEIPT' | 'TICKET';
    id: string | null;
}