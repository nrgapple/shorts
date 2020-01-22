import { Image } from "./Image";

export interface Profile {
    userId: number;
    firstName: string;
    lastName: string;
    about: string;
    username: string;
    height: number;
    dob: Date;
    token: string;
    images: Image[];
}