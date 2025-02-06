import { BoxList } from "./box-list.type";
import { Receipt } from "./receipt.type";


export type Owner = {
    id: string;
    firstName: string;
    lastName: string;  
    email: string;
    address: string; 
    documentNumber: number;
    numberOfVehicles: number;
    vehicleLicensePlates: string[];  
    vehicleBrands: string[];  
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    boxList: BoxList;
    receipts: Receipt[];
}