import { Customer } from "./cutomer.type";
import { ParkingType } from "./parking-type";

export const PARKING_TYPE = ['EXPENSES_1', 'EXPENSES_2', 'EXPENSES_ZOM_1','EXPENSES_ZOM_2','EXPENSES_ZOM_3',
    'EXPENSES_RICARDO_AZNAR', 'EXPENSES_ADOLFO_FONTELA', 'EXPENSES_NIDIA_FONTELA'
] as const;
export type Parking = (typeof PARKING_TYPE)[number];

export type Vehicle = {
    id: string;
    licensePlate: string;
    garageNumber: string;
    vehicleBrand: string;
    amount: number;
    parking: Parking;
    parkingType: ParkingType;
    customer: Customer;
}