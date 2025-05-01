import { BoxList } from "./box-list.type";


export type TicketRegistrationForDay = {
    id: string;
    description: string;
    price: number;
    days: number;
    weeks: number;
    departureTime: string;
    dateNow: Date | null;
    boxList: BoxList;
}