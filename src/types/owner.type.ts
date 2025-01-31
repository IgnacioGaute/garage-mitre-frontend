import { BoxList } from "./box-list.type";


export type Owner = {
    id: string;
    firstName: string;
    lastName: string;  
    email: string;
    documentNumber: number;
    vehicleLicesePlate: string;  
    vehicleBrand: string;  
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    boxList: BoxList;
}