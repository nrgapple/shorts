import React, { useEffect, useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonActionSheet, IonRefresher, IonRefresherContent } from '@ionic/react';
import { connect } from '../data/connect';
import './ChatsList.scss';
import { loadChats } from '../data/sessions/sessions.actions';
import { RouteComponentProps } from 'react-router-dom';
import { Chat } from '../models/Chat';
import ChatItem from '../components/ChatItem';

interface OwnProps extends RouteComponentProps { 
  token?: string;
};

interface StateProps {
  Chats?: Chat[]
};

interface DispatchProps {
  loadChats: typeof loadChats;
};

interface ChatsListProps extends OwnProps, StateProps, DispatchProps { };

const ChatsList: React.FC<ChatsListProps> = ({ Chats: chats, token, loadChats }) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>(undefined);
  const [, setIsDeletingChat] = useState(false);

  useEffect(() => {
    loadChats(token);
  },[])

  const onSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowActionSheet(true);
  }

  const onDeleteChat = async () => {
    if (token && selectedChat) {
      try {
        setIsDeletingChat(true);
        //TODO: delete chat.
      } catch (e) {
        console.log(`Could not create a chat: ${e}`);
      } finally {
        setIsDeletingChat(false);
      }
    }
  }

  return (
    <IonPage id="speaker-list">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`outer-content`}>
        <IonRefresher slot="fixed" 
          onIonRefresh={(event: any) => {
            setTimeout(() => {
              chats = undefined; 
              loadChats(token);
              event.detail.complete();
            }, 1000); 
          }}
          >
          <IonRefresherContent>
          </IonRefresherContent>
        </IonRefresher>
        <IonList lines="inset" inset>
          {chats ? (
            chats.map((chat) => (
              <ChatItem chat={chat} key={chat.recipient.userId} onAction={onSelectChat}/>
            ))
          ) : (
            [undefined, undefined, undefined, undefined].map((chat, key) => (
              <ChatItem key={key} chat={chat} onAction={() => {}}/>
            ))
          )} 
        </IonList>
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[{
            text: 'Remove',
            role: 'destructive',
            handler: () => {
              console.log(`See ${selectedChat && selectedChat.recipient.firstName}'s profile`);
            }, 
          }, {
            text: 'Chat',
            role: 'cancel',
            handler: () => {
              console.log(`Chat with ${selectedChat && selectedChat.recipient.firstName}`);
              onDeleteChat();
            }
          }
        ]}
        ></IonActionSheet>
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    Chats: state.data.chats,
    token: state.user.token,
  }),
  mapDispatchToProps: {
    loadChats
  },
  component: React.memo(ChatsList)
});