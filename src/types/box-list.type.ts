
import { Receipt } from "./receipt.type";
import { TicketRegistration } from "./ticket-registration.type";

export type BoxList = {
    id: string;
    date: Date;
    totalPrice: number;
    ticketRegistrations: TicketRegistration[];
    receipts: Receipt[]
}