import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { configureClient, subscribeToChatNotifications, subscribeToMatchNotifications, createChat, subscribeToUnmatchNotifications } from '../data/dataApi';
import { Profile } from '../models/Profile';
import { Client } from '@stomp/stompjs';
import { setClient, setIsClientConnected } from '../data/user/user.actions';
import { replaceChat, removeChat, removeMatch } from '../data/sessions/sessions.actions';
import { connect } from '../data/connect';
import { IonModal, IonButton, IonContent, IonHeader, IonToolbar, IonButtons, IonText, IonTitle, IonProgressBar, IonRow, IonIcon } from '@ionic/react';
import ImageCard from './ImageCard';
import InfoCard from './InfoCard';
import { heart } from 'ionicons/icons';
import { Chat } from '../models/Chat';

interface StateProps {
  token?: string,
  userProfile?: Profile,
  client?: Client,
  isClientConnected: boolean,
  chats?: Chat[],
  matches?: Profile[],
}

interface DispatchProps {
  setClient: typeof setClient,
  replaceChat: typeof replaceChat,
  setIsClientConnected: typeof setIsClientConnected,
  removeChat: typeof removeChat,
  removeMatch: typeof removeMatch,
}

interface ConnectionProps extends StateProps, DispatchProps { }

const Connections: React.FC<ConnectionProps> = ({
  token,
  userProfile,
  client,
  isClientConnected,
  setClient,
  setIsClientConnected,
  replaceChat,
  removeChat,
  removeMatch,
  chats,
  matches,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [match, setMatch] = useState<Profile | undefined>(undefined);
  const [creatingChat, setIsCreatingChat] = useState(false);

  const configure = () => {
    if (token && client) {
      configureClient(
        token,
        client,
        () => {
          setIsClientConnected(true);
          console.log(`Connected to socket`);
          subscribeToChatNotifications(
            client,
            (chat) => {
              chat.lastMessage && console.log(`New message from ${chat.recipient.firstName}: ${chat.lastMessage.content}`);
              replaceChat(chat);
            },
            `notify-chat-${userProfile!.userId}`,
          );
          subscribeToMatchNotifications(
            client,
            (profile) => {
              console.log(`MATCH!!`);
              console.log(profile);
              //history.push(`/more/${profile.userId}`);
              setMatch(profile);
              setShowModal(true);
            },
            `notify-match-${userProfile!.userId}`,
          );
          subscribeToUnmatchNotifications(
            client,
            (userId) => {
              console.log(`Unmatched with: ${userId}`);
              if (chats) {
                console.log(chats);
                const chat = chats.find(x => x.recipient.userId === userId);
                if (chat) {
                  removeChat(chat);
                }
              }
              if (matches) {
                const match = matches.find(x => x.userId === userId);
                if (match) {
                  removeMatch(match);
                }
              }
            },
            `notify-ummatch-${userProfile!.userId}`,
          );
        },
        () => {
          console.log(`Client disconnected`);
        },
        () => {
        },
        () => {
        }
      );
    }
  }

  const onCreateChat = async () => {
    if (token && match) {
      try {
        setIsCreatingChat(true);
        const chat = await createChat(match.userId, token);
        //console.log(history);
        history.push(`/chat/${chat.chatId}`, {direction: 'none'});
      } catch (e) {
        console.log(`Could not create a chat: ${e}`);
      } finally {
        setIsCreatingChat(false);
      }
    }
  }

  useEffect(() => {
    console.log(token);
    setClient(new Client());
  }, [token])

  useEffect(() => {
    console.log(`client changed: ${client}`);
    console.log(userProfile);
    if (!client || isClientConnected || !userProfile) return;
    console.log(`Now time to configure`);
    configure();
  }, [client, userProfile])

  return (
    <>
      <IonModal
        isOpen={showModal}
      >
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle color="danger">You got a Match!</IonTitle>
            {
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => {
                  setShowModal(false);
                  setMatch(undefined);
                }}
                >
                  Close
                </IonButton>
              </IonButtons>
            }
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {
            !match ? (
              <IonProgressBar type="indeterminate" />
            ) : (
              <>
                <IonRow>
                  <ImageCard areDeletable={false} images={match.images} />
                </IonRow>
                <InfoCard profile={match} />
                {
                  !creatingChat && <IonButton
                    fill="solid" 
                    color="success"
                    expand="block"
                    onClick={() => {
                      onCreateChat();
                      setTimeout(() => {
                        setShowModal(false);
                      }, 500);
                    }}
                  >
                    Start Chatting
                  </IonButton>
                }
              </>
            )
          }
        </IonContent>
      </IonModal>
    </>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    token: state.user.token,
    userProfile: state.data.userProfile,
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
    chats: state.data.chats,
    matches: state.data.matches,
  }),
  mapDispatchToProps: {
    setClient,
    replaceChat,
    setIsClientConnected,
    removeChat,
    removeMatch,
  },
  component: Connections,
});
