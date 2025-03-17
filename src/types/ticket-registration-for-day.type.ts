import { BoxList } from "./box-list.type";


export type TicketRegistrationForDay = {
    id: string;
    description: string;
    price: number;
    hours: number;
    departureTime: string;
    dateNow: Date | null;
    boxList: BoxList;
}