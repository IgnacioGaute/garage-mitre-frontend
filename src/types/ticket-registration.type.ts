import { BoxList } from "./box-list.type";
import { Ticket } from "./ticket.type";


export type TicketRegistration = {
    id: string;
    description: string;
    price: number;
    entryDay: Date;
    departureDay: Date;
    entryTime: string;
    departureTime: string;
    dateNow: Date | null;
    ticket: Ticket;
    boxList: BoxList;
}