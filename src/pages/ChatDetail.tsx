import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonInput, IonRow, IonCol, IonFooter, IonProgressBar, IonTitle, IonItem, IonToast } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { send } from 'ionicons/icons';
import './ChatDetail.scss';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { Chat } from '../models/Chat';
import { getMessages, publishMessageForClient, publishTypingForClient, subscribeToChatMessages, subscribeToTypingForClient } from '../data/dataApi';
import { setLoading, loadChats, loadProfile } from '../data/sessions/sessions.actions';
import { Client, StompHeaders } from '@stomp/stompjs';
import moment from 'moment';
import { getTimestamp } from '../util/util'


interface OwnProps extends RouteComponentProps { };

interface StateProps {
  userProfile?: Profile,
  chat?: Chat,
  token?: string,
  loading?: boolean,
  client?: Client,
  isClientConnected: boolean,
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
  client,
  isClientConnected,
  loading,
  loadChats,
  loadProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [recipientIsTyping, setRecipientIsTyping] = useState(false);
  const content = useRef(null);
  const value = useRef(null);

  const loadMessages = async (chatId: number, token: string) => {
    try {
      const messages = await getMessages(chatId, token);
      if (messages) {
        messages.sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime())
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
    //@ts-ignore
    else if (value.current.value !== "") {
      if (client && chat) {
        if (typingTimeout)
          clearTimeout(typingTimeout);
        setTypingTimeout(undefined);
        publishTypingForClient(client, chat.chatId, true);
        setTypingTimeout(setTimeout(() => {
          console.log(`You stopped typing.`);
          publishTypingForClient(client, chat.chatId, false);
        }, 5000));
      }
    //@ts-ignore
    } else if (value.current.value === "") {
      if (client && chat) {
        publishTypingForClient(client, chat.chatId, false);
      }
    }
  }

  const sendMessage = () => {
    // @ts-ignore
    if (!userProfile || value.current.value === "" || !chat ||
    !client)
      return;

    //@ts-ignore
    publishMessageForClient(client, chat.chatId, value.current.value);
    publishTypingForClient(client, chat.chatId, false);
      //@ts-ignore
    value.current.value = '';
  }
  
  const scrollToTheBottom = () => {
    if (!content || !content.current)
      return;

      setTimeout(() => {
      // @ts-ignore
      content.current.scrollToBottom(500);
    }, 200);
  }

  useEffect(() => {
    if (token && chat && client && !isClientConnected)
      (async () => {
        console.log(`chat`);
        console.log(chat);
        console.log(userProfile);
        setLoading(true);
        await loadMessages(chat.chatId, token);
        subscribeToChatMessages(
          client, 
          chat.chatId,
          (msg: Message) => {
            console.log(msg);
            setMessages(oldMessages => [...oldMessages, msg]
              .sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime()));
          },
        );
        subscribeToTypingForClient(
          client,
          chat.chatId,
          (isTyping: boolean) => {
            console.log(`isTyping is ${isTyping}`);
            setRecipientIsTyping(isTyping);
          },
        );

      })();
      
  }, [token, chat, client]);

  useEffect(() => {
    if (token)
    {
      if (!userProfile) loadProfile(token);
      loadChats(token);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (client && chat) {
        publishTypingForClient(client, chat.chatId, false);
        client.deactivate();
      }
    }
  },[]);

  useEffect(() => {
    scrollToTheBottom();
  }, [messages])

  return (
    <>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/chats"></IonBackButton>
              </IonButtons>
              <IonTitle>{chat&&chat.recipient.firstName}</IonTitle>
            </IonToolbar>
          </IonHeader>
            <IonContent scrollEvents={true} ref={content} >
              <>
              {
              loading || !chat || !userProfile ? (
                <IonProgressBar type="indeterminate" />
              ) : (
                  <IonList>
                    { messages &&
                      messages.map((message: Message, key, array) => {
                        const timestamp = getTimestamp(message.createdAt);
                        return (
                        <div key={key}>
                        {
                        message.fromUserId === userProfile.userId? (<>
                          <IonText>
                          
                        </IonText>
                          <div className="chat-bubble send" slot="end">
                            <IonText>
                              {message.content}
                            </IonText>
                            <p>
                              {timestamp}
                            </p>
                          </div>
                              </>
                        ) : (
                          <div slot="start" className="chat-bubble received">
                            <p>
                              {message.content}
                            </p>
                            <p>
                              {timestamp}
                            </p>
                          </div>
                        )}
                        </div>
                        )})
                    }
                    {
                      recipientIsTyping && 
                      <div slot="start" color="white" className="chat-bubble typing">
                        <IonText>
                          Typing...
                        </IonText>
                      </div>
                    }
                  </IonList>
              )}
              </>
            </IonContent>
            {
              !(loading || !chat || !userProfile) &&
              (
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
              )
            }
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
    client: state.user.client,
    isClientConnected: state.user.isClientConnected,
  }),
  mapDispatchToProps: {
    loadChats,
    loadProfile,
  },
  component: withRouter(ChatDetail)
});