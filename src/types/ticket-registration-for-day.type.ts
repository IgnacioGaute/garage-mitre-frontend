import { BoxList } from "./box-list.type";


export type TicketRegistrationForDay = {
    id: string;
    description: string;
    price: number;
    days: number;
    departureTime: string;
    boxList: BoxList;
}