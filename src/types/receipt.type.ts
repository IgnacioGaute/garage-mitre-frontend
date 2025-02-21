import { BoxList } from "./box-list.type";
import { Customer } from "./cutomer.type";

export const PAYMENT_STATUS_TYPE = ['PENDING', 'PAID'] as const;
export type PaymentStatusType = (typeof PAYMENT_STATUS_TYPE)[number];

export type Receipt = {
    id: string;
    status: PaymentStatusType;
    price: number;
    startAmount: number;
    lastInterestApplied: Date | null; 
    interestPercentage: number;
    paymentDate: Date | null;
    boxList: BoxList;
    customer: Customer;
}