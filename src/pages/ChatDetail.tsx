import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonInput, IonFooter, IonProgressBar, IonTitle, useIonViewDidEnter } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps, useLocation, useHistory } from 'react-router';
import * as selectors from '../data/selectors';
import { send, person } from 'ionicons/icons';
import './ChatDetail.scss';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { Chat } from '../models/Chat';
import { getMessages, publishMessageForClient, publishTypingForClient, subscribeToChatMessages, subscribeToTypingForClient, subscribeToChatRead, publishReadForClient } from '../data/dataApi';
import { loadChats, loadProfile, replaceChat } from '../data/sessions/sessions.actions';
import { Client, StompSubscription } from '@stomp/stompjs';
import { getTimestamp } from '../util/util';
import { chatMachine } from '../machines/chatDetailMachines';
import { useMachine } from '@xstate/react';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';

interface OwnProps extends RouteComponentProps { };

interface StateProps {
  userProfile?: Profile,
  chat?: Chat,
  token?: string,
  loading?: boolean,
  client?: Client,
  isClientConnected: boolean,
  visibility?: string,
};

interface DispatchProps {
  loadChats: typeof loadChats;
  loadProfile: typeof loadProfile;
  replaceChat: typeof replaceChat;
}

type ChatDetailProps = OwnProps & StateProps & DispatchProps;

const ChatDetail: React.FC<ChatDetailProps> = ({
  userProfile, 
  chat, 
  token, 
  client,
  isClientConnected,
  loadChats,
  loadProfile,
  replaceChat,
  visibility,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const [lastRead, setLastRead] = useState<number>(0);
  const [rendered, setRendered] = useState<boolean>(false);
  const content = useRef(null);
  const value = useRef(null);
  var subs = useRef<StompSubscription[]>([]);
  const location = useLocation();
  const history = useHistory();
  const [ chatState, chatSend, chatService ] = useMachine(chatMachine, {
    services: {
      loadMessages: async () => {
        if (chat && token) {
          try {
            const data = await getMessages(chat.chatId, token);
            if (data) {
              const messages = [...data.messages];
              messages.sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime())
              setMessages(messages);
              setLastRead(data.lastReadMessageId);
              chatSend('SUCCESS');
            }
          } catch (e) {
            console.log(`Error loading messages: ${e}`);
          }
          
        }
      },
    },
    actions: {
      sendMessage: () => {
        //@ts-ignore
        publishMessageForClient(client, chat.chatId, value.current.value);
        chatSend('USER_SENT');
      },
      clearInput: () => {
        //@ts-ignore
        value.current.value = '';
      },
      sendTyping: () => {
        publishTypingForClient(client!, chat!.chatId, true);
      },
      resetTypingTimout: () => {
        if (typingTimeout)
          clearTimeout(typingTimeout);
        setTypingTimeout(undefined);
        setTypingTimeout(setTimeout(() => {
          chatSend('USER_STOPPED');
        }, 5000));
      },
      stopTyping: () => {
        if (typingTimeout)
          clearTimeout(typingTimeout);
        setTypingTimeout(undefined);
        publishTypingForClient(client!, chat!.chatId, false);
      },
      scrollToTheBottom: () => {
        setTimeout(() => {
          scrollToTheBottom();
        }, 200);
      },
      subToChat: () => {
        subs.current = [...subs.current, subscribeToChatMessages(
          client!, 
          chat!.chatId,
          (msg: Message) => {
            setMessages(oldMessages => [...oldMessages, msg]
              .sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime()));
            if (msg.fromUserId !== userProfile!.userId)
              chatSend({type: 'REC_INCOMING_MSG', data: msg.messageId});
          },
          `chat-${userProfile!.userId}`,
        )];
        chatSend('SUB_CHAT_SUCCESS');
      },
      subToTyping: () => {
        subs.current = [...subs.current, subscribeToTypingForClient(
          client!,
          chat!.chatId,
          (isTyping: boolean) => {
            chatSend(isTyping?'REC_TYPED':'REC_STOPPED');
          },
          `typing-${userProfile!.userId}`,
        )];
        chatSend("SUB_TYPING_SUCCESS");
      },
      subToRead: () => {
        subs.current = [...subs.current, subscribeToChatRead(
          client!,
          chat!.chatId,
          (msgId: number) => {
            chatSend({type: 'REC_READ', data: msgId});
          },
          `read-${userProfile!.userId}`,
        )];
        const lastReadMessageFromRecipient = messages.slice().reverse().find(x => x.fromUserId === chat!.recipient!.userId);
        chatSend({type: 'SUB_READ_SUCCESS', data: lastReadMessageFromRecipient? lastReadMessageFromRecipient.messageId: -1});
      },
      getUnreadMessages: () => {
        if (chat!.hasUnreadMessages) {
          replaceChat({...chat!, hasUnreadMessages: false})
        }
        chatSend('SUCCESS');
      },
      sendRead: (context, event) => {
        // TODO: update latread.
        if (event.data) {
          publishReadForClient(
            client!,
            event.data,
          );
        }
        chatSend('REC_UPDATED');
      },
      updateLastRead: (context, event) => {
        // TODO: update the read message in messages.
        if (event.data) {
          setLastRead(event.data);
        }
        chatSend('READ_UPDATE_SUCCESS');
      }
    }
  });
  
  const onKeyPressed = (event: any) => {
    
    //@ts-ignore
    if (value.current.value !== "") {
      if (event.keyCode === 13) {
        if (chatState.matches({ready: {user: 'idle'}}) || chatState.matches({ready: {user: 'typing'}})) {
          chatSend('USER_SENT');
        }
      } 
      else if (chatState.matches({ready: {user: 'idle'}}) || chatState.matches({ready: {user: 'typing'}})) {
        chatSend('USER_TYPED');
      }
    //@ts-ignore
    } else {
      if (chatState.matches({ready: {user: 'typed'}})) {
        chatSend('USER_STOPPED');
      }
    }
  }
  
  const scrollToTheBottom = () => {
    if (!content || !content.current)
      return;

      setTimeout(() => {
      // @ts-ignore
      content.current.scrollToBottom(500);
    }, 200);
  }

  const unSub = (client: Client, chatId: number) => {
    publishTypingForClient(client, chatId, false);
    subs.current.forEach(s => s.unsubscribe());
    subs.current = [];
  }

  useEffect(() => {
    if (!chat)
      return;
    
    if (location.pathname !== `/chat/${chat.chatId}` &&
        subs && subs.current.length > 0 &&
        client) {
      unSub(client, chat.chatId);
      chatSend('LEFT');
    }
    else if (location.pathname === `/chat/${chat.chatId}`) {
      if (chatState.matches('notInView')) {
        chatSend('REENTERED');
      }
    }
  }, [location, chat, client])

  // Wait for all dependencies.
  useEffect(() => {
    if (token && 
        chat && 
        client && 
        isClientConnected && 
        userProfile &&
        rendered &&
        chatState.matches({init: 'wait'})) {
          chatSend('DEPENDENCIES_LOADED');
        }
  }, [token, chat, client, userProfile, isClientConnected, rendered]);

  // Get dependencies once we have our token.
  useEffect(() => {
    if (token)
    {
      if (!userProfile) loadProfile(token);
      loadChats(token);
    }
  }, [token]);

  // Clean up subs.
  useEffect(() => {
    return () => {
      if (client && chat) {
        unSub(client, chat.chatId);
      }
    }
  },[]);

  useEffect(() => {
    if (visibility && visibility === "visible") {
      // we need to fetch the messages and resub
      chatSend('DEPENDENCIES_LOADED');
    }
  }, [visibility])

  // Scroll to the bottom if new massages.
  useEffect(() => {
    if (!rendered) return;
    scrollToTheBottom();
  }, [messages])

  // Log the states.
  useEffect(() => {
    const subscription = chatService.subscribe(state => {
    });
  
    return subscription.unsubscribe;
  }, [chatService]); // note: service should never change

  // the component finished rendering.
  useIonViewDidEnter(() => {
    setRendered(true);
  })

  return (
    <>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/chats"></IonBackButton>
              </IonButtons>
              <IonTitle>{chat&&chat.recipient.firstName}</IonTitle>
              {
                chat && chatState.matches('ready') &&
                <IonButtons slot="end">
                  <IonButton fill="clear" onClick={() => history.push(`/more/${chat.recipient.userId}`, {direction: 'forward'})}>
                    <IonIcon icon={person}/>
                  </IonButton>
                </IonButtons>
              }
            </IonToolbar>
          </IonHeader>
            <IonContent scrollEvents={true} ref={content} >
              {
              !chatState.matches('ready')? (
                <IonProgressBar type="indeterminate" />
              ) : (
                  <IonList>
                    { messages &&
                      messages.map((message: Message, key) => {
                        const timestamp = getTimestamp(message.createdAt);
                        return (
                        <div key={key}>
                        {
                        message.fromUserId === userProfile!.userId? (<>
                          <IonText>
                          
                        </IonText>
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
                              </>
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
                        </div>
                        )})
                    }
                    {
                      chatState.matches({ready: {recipientTyping: 'typing'}}) && 
                      <div slot="start" color="white" className="chat-bubble typing">
                        <p>
                          Typing...
                        </p>
                      </div>
                    }
                  </IonList>
              )}
            </IonContent>
            {
              chatState.matches('ready') &&
              (
                <IonFooter>
                  <IonToolbar>
                    <IonButton 
                      slot="end" 
                      fill="clear" 
                      onClick={() => {
                        //@ts-ignore
                        value.current.value !== "" &&
                        chatSend('USER_SENT');
                      }}
                      disabled={chatState.matches({ready: 'sendMessage'})}
                    >
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
    visibility: state.user.visibility,
  }),
  mapDispatchToProps: {
    loadChats,
    loadProfile,
    replaceChat,
  },
  component: withRouter(ChatDetail)
});