import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { configureClient, subscribeToChatNotifications, subscribeToMatchNotifications, createChat } from '../data/dataApi';
import { Profile } from '../models/Profile';
import { Client } from '@stomp/stompjs';
import { setClient, setIsClientConnected } from '../data/user/user.actions';
import { replaceChat } from '../data/sessions/sessions.actions';
import { connect } from '../data/connect';
import { IonModal, IonButton, IonContent, IonHeader, IonToolbar, IonButtons, IonText, IonTitle, IonProgressBar, IonRow, IonIcon } from '@ionic/react';
import ImageCard from './ImageCard';
import InfoCard from './InfoCard';
import { heart } from 'ionicons/icons';

interface StateProps {
  token?: string,
  userProfile?: Profile,
  client?: Client,
  isClientConnected: boolean,
}

interface DispatchProps {
  setClient: typeof setClient,
  replaceChat: typeof replaceChat,
  setIsClientConnected: typeof setIsClientConnected,
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
}) => {
  const history = useHistory();
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
      <IonContent>
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
      </IonContent>
    </>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    token: state.user.token,
    userProfile: state.data.userProfile,
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
  }),
  mapDispatchToProps: {
    setClient,
    replaceChat,
    setIsClientConnected,
  },
  component: Connections,
});
