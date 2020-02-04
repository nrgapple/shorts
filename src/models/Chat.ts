import { Message } from "./Message";
import { Profile } from "./Profile";

export interface Chat {
    chatId: number;
    recipient: Profile;
    lastMessage: Date;
    lastUnreadMessage?: string;
}