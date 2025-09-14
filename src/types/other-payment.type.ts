import { BoxList } from "./box-list.type";

export const PAYMENT_TYPE = ['EGRESOS', 'INGRESOS'] as const;
export type PaymentType = (typeof PAYMENT_TYPE)[number];

export type OtherPayment = {
    id: string;
    description: string;
    price: number;
    type: PaymentType;
    dateNow: Date | null;
    boxList: BoxList;
}