import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonList, IonInput, IonFooter, IonProgressBar, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent, useIonViewDidEnter } from '@ionic/react';
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
import { chatMachine } from '../machines/chatDetailMachines';
import { useMachine } from '@xstate/react';
import MessageList from '../components/MessageList';

interface OwnProps extends RouteComponentProps { };

interface StateProps {
  userProfile?: Profile,
  chat?: Chat,
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
  const content = useRef(null);
  const value = useRef(null);
  const scroller = useRef<any>();
  var subs = useRef<StompSubscription[]>([]);
  const location = useLocation();
  const history = useHistory();
  const [ chatState, chatSend, chatService ] = useMachine(chatMachine, {
    services: {
      loadMessages: async () => {
        if (chat) {
          try {
            const data = await getMessages(chat.chatId);
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
            setMessages(oldMessages => [...oldMessages, msg]);
            if (msg.fromUserId !== userProfile!.userId)
              chatSend({type: 'REC_INCOMING_MSG', data: msg});
          },
          `chat-${userProfile!.userId}`,
        )];
        const lastReadMessageFromRecipient = messages.slice(-1)[0];
        chatSend({type:'SUB_CHAT_SUCCESS', data: lastReadMessageFromRecipient});
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
        chatSend('SUB_READ_SUCCESS');
      },
      getUnreadMessages: () => {
        if (chat!.hasUnreadMessages) {
          replaceChat({...chat!, hasUnreadMessages: false})
        }
        chatSend('SUCCESS');
      },
      sendRead: (context, event) => {
        // update socket.
        var msg = event.data as Message;
        if (event.data) {
          publishReadForClient(
            client!,
            msg.messageId,
          );
        }

        // update chat to have the newest read message.
        if (msg) {
          console.log('here');
          replaceChat({...chat!, 
            hasUnreadMessages: false,
            lastMessage: msg
          });
        } else {
          console.error('no message found');
        }
        chatSend('REC_UPDATED');
      },
      updateLastRead: (context, event) => {
        // TODO: update the read message in messages.
        if (event.data) {
          setLastRead(event.data);
        }
        chatSend('READ_UPDATE_SUCCESS');
      },
      unSub: () => {
        onUnsub();
      },
      bypass: () => {
        console.log(`checking dependencies: ${chatState.matches({init: 'wait'})}`);
        chatSend('DEPENDENCIES_LOADED');
      }
    }
  });
  
  const onUnsub = () => {
    console.log("unSubbing");
    publishTypingForClient(client!, chat!.chatId, false);
    subs.current.forEach(s => s.unsubscribe());
    subs.current = [];
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
        if (content && content.current) {
        // @ts-ignore
        content.current.scrollToBottom(500);
      }
    }, 200);
  }

  useEffect(() => {
    if (!chat)
      return;
    
    if (location.pathname !== `/chat/${chat.chatId}` &&
        subs && subs.current.length > 0 &&
        client) {
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
    if (
        chat && 
        client && 
        isClientConnected && 
        userProfile &&
        chatState.matches({init: 'wait'})) {
          chatSend('DEPENDENCIES_LOADED');
        }
  }, [chat, client, userProfile, isClientConnected]);

  // Clean up subs.
  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('unmount')
      if (client && chat) {
        onUnsub();
      }
    }
  },[]);

  useEffect(() => {
    if (visibility && visibility === "visible") {
      // we need to fetch the messages and resub
      console.log("visible");
      chatSend('REENTERED');
    } else if (visibility && visibility === "hidden") {
      console.log("hidden");
      chatSend('LEFT');
    }
  }, [visibility])

  // Scroll to the bottom if new massages.
  useEffect(() => {
    //if (!rendered) return;
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
            <IonContent ref={content} >
              {
              !chatState.matches('ready')? (
                <IonProgressBar type="indeterminate" />
              ) : (
                <div>
                    <div>
                      <IonInfiniteScroll ref={scroller} position="top" onIonInfinite={() => {console.log('hello'); scroller.current.complete()}}>
                        <IonInfiniteScrollContent></IonInfiniteScrollContent>
                      </IonInfiniteScroll>
                    </div>
                    <IonList>
                          { messages &&
                            messages.map((message: Message, key) =>
                              <MessageList key={key} message={message} lastRead={lastRead} userProfile={userProfile!} /> 
                            )
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
                  </div>
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