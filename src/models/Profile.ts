import { Image } from "./Image";
import { GeoPoint } from "./GeoPoint";

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
    location?: GeoPoint;
    displayAddress?: string;
    searchMiles?: number;
}