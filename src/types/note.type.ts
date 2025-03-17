import { User } from "./user.type";

export type Note = {

    id: string;
    description: string;
    date: string | null;
    hours: string | null;
    user: User;
    createdAt: Date;
}