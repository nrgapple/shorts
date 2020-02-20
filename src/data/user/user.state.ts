import { GeoPoint } from "../../models/GeoPoint";
import { Client } from "@stomp/stompjs";

export interface UserState {
  isLoggedin: boolean;
  username?: string;
  darkMode: boolean;
  hasSeenTutorial: boolean;
  token?: string;
  loading: boolean;
  location?: GeoPoint;
  client?: Client;
  isClientConnected: boolean;
};
