import { Image } from "./Image";

export interface Profile {
    userId: number;
    firstName: string;
    lastName: string;
    about?: string;
    username: string;
    height?: number;
    dob: Date;
    images: Image[];
    gender?: 'male' | 'female';
    genderPref?: 'male' | 'female';
}