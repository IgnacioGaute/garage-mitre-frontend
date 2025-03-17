import { BoxList } from "./box-list.type";


export type OtherPayment = {
    id: string;
    description: string;
    price: number;
    dateNow: Date | null;
    boxList: BoxList;
}