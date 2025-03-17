import { Customer } from "./cutomer.type";

export const PARKING_TYPE = ['ONE_TYPE', 'EXPENSES_1', 'EXPENSES_2', 'EXPENSES_3'] as const;
export type ParkingType = (typeof PARKING_TYPE)[number];

export type Vehicle = {
    id: string;
    licensePlate: string;
    vehicleBrand: string;
    amount: number;
    parkingType: ParkingType;
    customer: Customer;
}