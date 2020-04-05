import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router';
import { configureClient, subscribeToChatNotifications, subscribeToMatchNotifications, createChat, subscribeToUnmatchNotifications } from '../data/dataApi';
import { Profile } from '../models/Profile';
import { Client, StompSubscription } from '@stomp/stompjs';
import { setClient, setIsClientConnected, setIsLoggedIn } from '../data/user/user.actions';
import { replaceChat, removeChat, removeMatch } from '../data/sessions/sessions.actions';
import { connect } from '../data/connect';
import { IonModal, IonButton, IonContent, IonHeader, IonToolbar, IonButtons, IonText, IonTitle, IonProgressBar, IonRow, IonIcon } from '@ionic/react';
import InfoCard from './InfoCard';
import { Chat } from '../models/Chat';

interface StateProps {
  token?: string,
  userProfile?: Profile,
  client?: Client,
  isClientConnected: boolean,
  chats?: Chat[],
  matches?: Profile[],
  isLoggedIn: boolean,
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
  isLoggedIn,
}) => {
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const [match, setMatch] = useState<Profile | undefined>(undefined);
  const [creatingChat, setIsCreatingChat] = useState(false);
  const [wasLoggedInAndSubbed, setWasLoggedInAndSubbed] = useState(false);
  var subs = useRef<StompSubscription[]>([]);

  const configure = () => {
    if (client && client.connected === false) {
      configureClient(
        token,
        client,
        () => {
          setIsClientConnected(true);
          subs.current = [...subs.current, subscribeToChatNotifications(
            client,
            (chat) => {
              chat.lastMessage && console.log(`New message from ${chat.recipient.firstName}: ${chat.lastMessage.content}`);
              replaceChat(chat);
            },
            `notify-chat-${userProfile!.userId}`,
          )];
          subs.current = [...subs.current, subscribeToMatchNotifications(
            client,
            (profile) => {
              setMatch(profile);
              setShowModal(true);
            },
            `notify-match-${userProfile!.userId}`,
          )];
          subs.current = [...subs.current, subscribeToUnmatchNotifications(
            client,
            (userId) => {
              if (chats) {
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
          )];
          setWasLoggedInAndSubbed(true);
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

  const disconnect = () => {
    if (client)
      client.deactivate();
    setIsClientConnected(false);
  }

  const onCreateChat = async () => {
    if (match) {
      try {
        setIsCreatingChat(true);
        const chat = await createChat(match.userId);
        history.push(`/chat/${chat.chatId}`, {direction: 'none'});
      } catch (e) {
        console.log(`Could not create a chat: ${e}`);
      } finally {
        setIsCreatingChat(false);
      }
    }
  }

  useEffect(() => {
    if (isLoggedIn && !wasLoggedInAndSubbed ) {
      setClient(new Client());
    } else if (!isLoggedIn && wasLoggedInAndSubbed) {
      disconnect();
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!client || isClientConnected || !userProfile) return;
    configure();
  }, [client, userProfile, isClientConnected])

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
                <div>
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
                </div>

            )
          }
        </IonContent>
      </IonModal>
    </>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    userProfile: state.data.userProfile,
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
    chats: state.data.chats,
    matches: state.data.matches,
    isLoggedIn: state.user.isLoggedin,
    token: state.user.token,
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
