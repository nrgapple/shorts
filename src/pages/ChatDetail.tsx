import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonInput, IonFooter, IonProgressBar, IonTitle } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { send, person } from 'ionicons/icons';
import './ChatDetail.scss';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { Chat } from '../models/Chat';
import { getMessages, publishMessageForClient, publishTypingForClient, subscribeToChatMessages, subscribeToTypingForClient } from '../data/dataApi';
import { loadChats, loadProfile, replaceChat } from '../data/sessions/sessions.actions';
import { Client, StompSubscription } from '@stomp/stompjs';
import { getTimestamp } from '../util/util';
import { chatMachine } from '../machines/chatDetailMachines';
import { useMachine } from '@xstate/react';

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
  history,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const content = useRef(null);
  const value = useRef(null);
  var subs = useRef<StompSubscription[]>([]);
  const [ chatState, chatSend, chatService ] = useMachine(chatMachine, {
    services: {
      loadMessages: async () => {
        if (chat && token) {
          await loadMessages(chat.chatId, token);
          console.log('loaded messages');
          chatSend('SUCCESS');
        } else {
          console.error(`should not get here: chat: ${chat}`);
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
        console.log('setting timeout');
        if (typingTimeout)
          clearTimeout(typingTimeout);
        setTypingTimeout(undefined);
        setTypingTimeout(setTimeout(() => {
          console.log(`You stopped typing.`);
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
          console.log('scroll to bottom');
          scrollToTheBottom();
        }, 200);
      },
      subToChat: () => {
        subs.current = [...subs.current, subscribeToChatMessages(
          client!, 
          chat!.chatId,
          (msg: Message) => {
            console.log(msg);
            setMessages(oldMessages => [...oldMessages, msg]
              .sort((a:Message, b:Message) => a.createdAt.getTime() - b.createdAt.getTime()));
          },
          `chat-${userProfile!.userId}`,
        )];
        console.log(subs.current);
        chatSend('SUB_CHAT_SUCCESS');
      },
      subToTyping: () => {
        subs.current = [...subs.current, subscribeToTypingForClient(
          client!,
          chat!.chatId,
          (isTyping: boolean) => {
            chatSend(isTyping?'REC_TYPED':'REC_STOPPED');
            console.log(`isTyping is ${isTyping}`);
          },
          `typing-${userProfile!.userId}`,
        )];
        console.log(subs.current);
        chatSend("SUB_TYPING_SUCCESS");
      },
      getUnreadMessages: () => {
        console.log('getting unread');
        if (chat!.hasUnreadMessages) {
          replaceChat({...chat!, hasUnreadMessages: false})
        }
        chatSend('SUCCESS');
      }
    }
  });

  const loadMessages = async (chatId: number, token: string) => {
    try {
      console.log('starting to load');
      const messages = await getMessages(chatId, token);
      console.log(messages);
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
    
    //@ts-ignore
    if (value.current.value !== "") {
      if (event.keyCode === 13) {
        if (chatState.matches({ready: {user: 'idle'}}) || chatState.matches({ready: {user: 'typing'}})) {
          chatSend('USER_SENT');
        }
      } 
      else if (chatState.matches({ready: {user: 'idle'}}) || chatState.matches({ready: {user: 'typing'}})) {
        console.log('setting typing');
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

  const getProgress = () => {
    if (chatState.matches({init: 'wait'}))
      return .4;
    else if (chatState.matches({init: {fetchMessages: 'loadMessages'}}))
      return .9;
    else if (chatState.matches({init: {fetchMessages: 'getUnreadMessages'}}))
      return .95;
    else if (chatState.matches('subscribe'))
      return .98;
    else if (chatState.matches('ready'))
      return 1;
  }

  // Wait for all dependencies.
  useEffect(() => {
    if (token && 
        chat && 
        client && 
        isClientConnected && 
        userProfile &&
        chatState.matches({init: 'wait'})) {
          chatSend('DEPENDENCIES_LOADED');
        }
  }, [token, chat, client, userProfile, isClientConnected]);

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
        console.log(`Unsubscribing to chat`);
        publishTypingForClient(client, chat.chatId, false);
        console.log(subs.current);
        subs.current.forEach(s => s.unsubscribe());
      }
    }
  },[]);

  // Scroll to the bottom if new massages.
  useEffect(() => {
    scrollToTheBottom();
  }, [messages])

  // Log the states.
  useEffect(() => {
    const subscription = chatService.subscribe(state => {
      // simple state logging
      console.log(state);
    });
  
    return subscription.unsubscribe;
  }, [chatService]); // note: service should never change
  
  

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
                chat &&
                <IonButtons slot="end">
                  <IonButton fill="clear" onClick={() => history.push(`/more/${chat.recipient.userId}`, {direction: 'forward'})}>
                    <IonIcon icon={person}/>
                  </IonButton>
                </IonButtons>
              }
            </IonToolbar>
          </IonHeader>
            <IonContent scrollEvents={true} ref={content} >
              <>
              {
              !chatState.matches('ready')? (
                <IonProgressBar type="determinate" value={getProgress()}/>
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
                      chatState.matches({ready: {recipient: 'typing'}}) && 
                      <div slot="start" color="white" className="chat-bubble typing">
                        <p>
                          Typing...
                        </p>
                      </div>
                    }
                  </IonList>
              )}
              </>
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
  }),
  mapDispatchToProps: {
    loadChats,
    loadProfile,
    replaceChat,
  },
  component: withRouter(ChatDetail)
});