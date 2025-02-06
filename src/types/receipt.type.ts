import { Owner } from "./owner.type";
import { Renter } from "./renter.type";

export const PAYMENT_STATUS_TYPE = ['PENDING', 'PAID'] as const;
export type PaymentStatusType = (typeof PAYMENT_STATUS_TYPE)[number];

export type Receipt = {
    id: string;
    status: PaymentStatusType;
    paymentDate: Date | null;
    owner: Owner;
    renter: Renter;
}