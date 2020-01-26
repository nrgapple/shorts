import { GeoPoint } from "../../models/GeoPoint";

export interface UserState {
  isLoggedin: boolean;
  username?: string;
  darkMode: boolean;
  hasSeenTutorial: boolean;
  token?: string;
  loading: boolean;
  location?: GeoPoint;
};
