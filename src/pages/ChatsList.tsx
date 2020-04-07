import React, { useEffect, useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonActionSheet, IonRefresher, IonRefresherContent, IonAlert } from '@ionic/react';
import { connect } from '../data/connect';
import './ChatsList.scss';
import { loadChats, removeMatch, removeChat } from '../data/sessions/sessions.actions';
import { RouteComponentProps } from 'react-router-dom';
import { Chat } from '../models/Chat';
import ChatItem from '../components/ChatItem';
import { deleteMatch } from '../data/dataApi';

interface OwnProps extends RouteComponentProps { 
};

interface StateProps {
  Chats?: Chat[]
};

interface DispatchProps {
  loadChats: typeof loadChats;
  removeChat: typeof removeChat;
  removeMatch: typeof removeMatch;
};

interface ChatsListProps extends OwnProps, StateProps, DispatchProps { };

const ChatsList: React.FC<ChatsListProps> = ({ 
  Chats: chats, 
  removeChat,
  removeMatch,
  loadChats,
}) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | undefined>(undefined);
  const [IsDeletingChat, setIsDeletingChat] = useState(false);

  useEffect(() => {
    loadChats();
  },[]);

  const onSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setShowDeleteAlert(true);
  }

  const onDeleteChat = async () => {
    if (selectedChat) {
      try {
        setIsDeletingChat(true);
        await deleteMatch(selectedChat!.recipient.userId);
        removeChat(selectedChat);
        removeMatch(selectedChat.recipient);
      } catch (e) {
        console.log(`Could not remove chat: ${e}`);
      } finally {
        setIsDeletingChat(false);
        setShowDeleteAlert(false)
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
              loadChats();
              event.detail.complete();
            }, 1000); 
          }}
          >
          <IonRefresherContent>
          </IonRefresherContent>
        </IonRefresher>
        <IonList lines="inset" inset style={{ padding: '0', margin: '0'}}>
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
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={`Remove Match`}
          message={`Are you sure you want to unmatch with ${selectedChat?selectedChat.recipient.firstName: ''}`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              handler: blah => {
                console.log('Confirm Cancel: blah');
              }
            },
            {
              text: 'Unmatch',
              role: 'destructive',
              handler: () => {
                onDeleteChat();
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    Chats: state.data.chats,
  }),
  mapDispatchToProps: {
    loadChats,
    removeChat,
    removeMatch,
  },
  component: React.memo(ChatsList)
});