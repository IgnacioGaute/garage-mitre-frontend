import { Customer } from "./cutomer.type";


export type Vehicle = {
    id: string;
    licensePlate: string;
    vehicleBrand: string;
    amount: number;
    customer: Customer;
}