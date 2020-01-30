import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonInput, IonRow, IonCol, IonFooter, IonProgressBar, IonTitle } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { send } from 'ionicons/icons';
import './ChatDetail.scss';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { Chat } from '../models/Chat';
import { getMessages, configureChatClient, publishMessageForClient } from '../data/dataApi';
import { setLoading, loadChats, loadProfile } from '../data/sessions/sessions.actions';
import { Client, StompHeaders } from '@stomp/stompjs';


interface OwnProps extends RouteComponentProps { };

interface StateProps {
  userProfile?: Profile,
  chat?: Chat,
  token?: string,
  loading?: boolean,
};

interface DispatchProps {
  loadChats: typeof loadChats;
  loadProfile: typeof loadProfile;
}

type ChatDetailProps = OwnProps & StateProps & DispatchProps;

const ChatDetail: React.FC<ChatDetailProps> = ({
  userProfile, 
  chat, 
  token, 
  loading,
  loadChats,
  loadProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [isClientConnected, setIsClientConnected] = useState(false);
  const content = useRef(null);
  const value = useRef(null);

  const loadMessages = async (chatId: number, token: string) => {
    try {
      const messages = await getMessages(chatId, token);
      if (messages) {
        setMessages(messages);
      } else {
        console.log(`No messages found`);
      }
    } catch (e) {
      console.log(`Error loading messages: ${e}`);
    }
  }
  
  const onKeyPressed = (event: any) => {
    if (event.keyCode == 13) {
      sendMessage();
    }
  }

  const sendMessage = () => {
    // @ts-ignore
    if (!userProfile || value.current.value === "" || !chat)
      return;

    //@ts-ignore
    publishMessageForClient(client, chat.chatId, value.current.value);
      //@ts-ignore
    value.current.value = '';
  }
  
  const scrollToTheBottom = () => {
    if (!content || !content.current)
      return;

    // @ts-ignore
    content.current.scrollToBottom();
  }


  useEffect(() => {
    if (token && chat && client && !isClientConnected)
      (async () => {
        console.log(`chat`);
        console.log(chat);
        console.log(userProfile);
        setLoading(true);
        await loadMessages(chat.chatId, token);
        configureChatClient(
          token,
          client,
          chat.chatId,
          () => {
            console.log(`Connected to chat`);
            setIsClientConnected(true);
            setLoading(false);
          },
          () => {
            console.log(`Disconnect to chat ${chat.chatId}`);
            setIsClientConnected(false);
          },
          () => {
            console.log(`Websocket was closed for chat ${chat.chatId}`);
            setIsClientConnected(false);
          },
          (msg: Message) => {
            console.log(`Go a message! msg: ${msg}`);
            const oldMessages = messages;
            setMessages(oldMessages => [...oldMessages, msg]);
          },
          () => {
            setLoading(false);
          }
        );

      })();
      return () => {
        if (client)
          client.deactivate();
      }
  }, [token, chat, client]);

  useEffect(() => {
    if (token)
    {
      if (!userProfile) loadProfile(token);
      loadChats(token);
    }
  }, [token]);

  useEffect(() => {
    setClient(new Client());
  },[]);

  useEffect(() => {
    scrollToTheBottom();
  }, [messages])

  return (
    <>
        <IonPage id="session-detail-page">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/chats"></IonBackButton>
              </IonButtons>
              <IonTitle>{chat&&chat.recipient.firstName}</IonTitle>
            </IonToolbar>
          </IonHeader>
            <IonContent scrollEvents={true} ref={content}>
              <>
              {
              loading || !chat || !userProfile ? (
                <IonProgressBar type="indeterminate" />
              ) : (
              <IonRow>
                
                <IonCol size="12" style={{"--ion-grid-column-padding": 0, height: "100%"}}>
                  <IonList>
                    {
                      messages.map((message, key) => (
                        
                        message.fromUserId === userProfile.userId? (
                          <div key={key} className="chat-bubble send">
                            <IonText>
                              {message.content}
                            </IonText>
                          </div>

                        ) : (
                          <div key={key} className="chat-bubble received">
                            <IonText>
                              {message.content}
                            </IonText>
                          </div>
                        )
                      ))
                    }
                  </IonList>
                </IonCol>
              </IonRow>
              )}
              </>
            </IonContent>
            <IonFooter>
              <IonToolbar>
                <IonButton slot="end" fill="clear" onClick={sendMessage}>
                  <IonIcon icon={send} />
                </IonButton>
                <IonInput 
                  spellCheck 
                  autofocus 
                  autocomplete="off" 
                  autocorrect="on" 
                  placeholder="Send a message..." 
                  ref={value} 
                  onKeyDown={onKeyPressed}
                  onFocus={scrollToTheBottom}
                />
              </IonToolbar>
            </IonFooter>
        </IonPage>
    </>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state, OwnProps) => ({
    chat: selectors.getChat(state, OwnProps),
    userProfile: state.data.userProfile,
    token: state.user.token,
    loading: state.data.loading,
  }),
  mapDispatchToProps: {
    loadChats,
    loadProfile,
  },
  component: withRouter(ChatDetail)
});