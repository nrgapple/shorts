import React from 'react';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { IonText, IonItem } from '@ionic/react';
import { getTimestamp } from '../util/util';

interface MessageListProps {
    message: Message,
    lastRead: number,
    userProfile: Profile
}

const MessageList: React.FC<MessageListProps> = ({ message, lastRead, userProfile  }) => {
    const timestamp = getTimestamp(message.createdAt);
    return (
        <IonItem lines="none">
            {
            message.fromUserId === userProfile!.userId? (
                <div className="chat-bubble send" slot="end">
                    <p>
                        {message.content}
                    </p>
                    <p>
                        <i>{timestamp}</i>
                    </p>
                {
                    lastRead === message.messageId &&
                    <p className="read">
                    Read 
                    </p>
                }
                </div>
            ) : (
                <div slot="start" className="chat-bubble received">
                    <p>
                        {message.content}
                    </p>
                    <p>
                        <i>{timestamp}</i>
                    </p>
                </div>
            )}
            </IonItem>
  );
};

export default MessageList;