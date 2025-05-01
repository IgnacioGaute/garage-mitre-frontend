import { Customer } from "./cutomer.type";
import { Vehicle } from "./vehicle.type";

 export type VehicleRenter = {

    id: string;
    garageNumber: string;
    amount: number;
    owner: string;
    vehicle: Vehicle;
    customer: Customer;
    deletedAt: Date;
 }