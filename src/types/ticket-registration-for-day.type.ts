import { BoxList } from "./box-list.type";

export const TICKET_TIME_TYPE = ['DIA', 'SEMANA', 'SEMANA_Y_DIA'] as const;
export type TicketTimeType = (typeof TICKET_TIME_TYPE)[number];

export type TicketRegistrationForDay = {
    id: string;
    description: string;
    price: number;
    weeks: number;
    days: number;
    dateNow: Date | null;
    ticketTimeType: TicketTimeType;
    firstNameCustomer: string;
    lastNameCustomer: string;
    vehiclePlateCustomer: string;
    paid: boolean;
    retired: boolean;
    boxList: BoxList;
}