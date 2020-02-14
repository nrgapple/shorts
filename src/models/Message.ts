export interface Message {
    fromUserId: number;
    firstName: string;
    lastName: string;
    content: string;
    createdAt: Date;
    messageId: number;
}