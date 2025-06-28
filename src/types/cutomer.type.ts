import { PaymentStatusType, Receipt } from "./receipt.type";
import { VehicleRenter } from "./vehicle-renter";
import { Vehicle } from "./vehicle.type";


export const CUSTOMER_TYPE = ['OWNER', 'RENTER', 'PRIVATE'] as const;
export type CustomerType = (typeof CUSTOMER_TYPE)[number];



export type Customer = {
    id: string;
    firstName: string;
    lastName: string;  
    phone: string;
    comments: string;
    customerNumber: number;
    numberOfVehicles: number;
    startDate: string | null; 
    previusStartDate: string | null;  
    customerType: CustomerType;
    hasDebt: boolean;
    monthsDebt?: {
      month: string;
      amount: number;
      status?: PaymentStatusType;
    }[];
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    receipts: Receipt[];
    vehicles: Vehicle[];
    vehicleRenters: VehicleRenter[];
}