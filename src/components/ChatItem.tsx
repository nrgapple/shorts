import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonItem, IonAvatar, IonSkeletonText, IonIcon, IonLabel, IonButton, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import { Profile } from '../models/Profile';
import { contact, more } from 'ionicons/icons';
import { Chat } from '../models/Chat';

interface ChatItemProps {
  chat?: Chat;
  onAction: (chat: Chat) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onAction }) => {
  
  return (
    <>
    {
      chat? (
      <>
      <IonItemSliding>
        <IonItem detail={false} lines="none" routerLink={`/chat/${chat.chatId}`}>
          {chat.recipient.images.length > 0? (
            <IonAvatar slot="start">
              <img src={chat.recipient.images[0].imageUrl} alt="Pic" />
            </IonAvatar>
          ):(
            <IonAvatar slot="start">
              <img src={"https://via.placeholder.com/150?text=No+Image"} alt="Pic" />
            </IonAvatar>
          )}
          <IonLabel >{chat.recipient.firstName}</IonLabel> 
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={() => onAction(chat)}>Remove</IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
      </>
      ) : (
        <IonItem lines="none">
          <IonAvatar slot="start">
            <IonSkeletonText animated style={{width: '30%'}}/>
          </IonAvatar>
          <IonSkeletonText animated style={{width: '70%'}}/>
        </IonItem>
      )
    }
    
    </>
  );
};

export default ChatItem;