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
import { getMessages } from '../data/dataApi';
import { setLoading, loadChats, loadProfile } from '../data/sessions/sessions.actions';

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
  const [isUser, setIsUser] = useState(false);
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
    if (!userProfile || value.current.value === "")
      return;

    setIsUser(true);
      setMessages([...messages, 
        {
          fromUserId: userProfile.userId,
          firstName: userProfile.firstName, 
          //@ts-ignore
          content: value.current.value,
          lastName: userProfile.lastName,
          sentAt: new Date(Date.now()),
        }]);
      scrollToTheBottom();
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
    if (token && chat)
      (async () => {
        console.log(`chat`);
        console.log(chat);
        console.log(userProfile);
        setLoading(true);
        await loadMessages(chat.chatId, token);
        setLoading(false);
        scrollToTheBottom();
      })();
  }, [token, chat]);

  useEffect(() => {
    if (token)
    {
      if (!userProfile) loadProfile(token);
      loadChats(token);
    }
  }, [token])

  useEffect(() => {
    console.log('here');
    if (isUser && chat) {
      setIsUser(false);
      setTimeout(() => {
        setMessages([...messages, 
          {
            fromUserId: chat.recipient.userId,
            firstName: chat.recipient.firstName, 
            lastName: chat.recipient.lastName,
            sentAt: new Date(Date.now()),
            content: "Hey"
          }])
        scrollToTheBottom();
      }, 2000);
    }
  }, [messages])
  
  return (
    <>
        <IonPage id="session-detail-page">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/matches"></IonBackButton>
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