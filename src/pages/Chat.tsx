import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonInput, IonRow, IonCol, IonFooter, IonProgressBar } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { send } from 'ionicons/icons';
import './Chat.scss';
import { Message } from '../models/Message';
import { Profile } from '../models/Profile';
import { Chat } from '../models/Chat';
import { getMessages } from '../data/dataApi';
import { setLoading } from '../data/sessions/sessions.actions';

interface OwnProps extends RouteComponentProps { };

interface StateProps {
  userProfile?: Profile,
  chat?: Chat,
  token?: string,
  loading?: boolean,
};

interface DispatchProps {}

type ChatDetailProps = OwnProps & StateProps & DispatchProps;

const Chat: React.FC<ChatDetailProps> = ({
  userProfile, 
  chat, 
  token, 
  loading
}) => {

  const [messages, setMessages] = useState<Message[]>([]);
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
    if (!userProfile || !chat)
      return;

    // @ts-ignore
    if (event.keyCode == 13 && value.current.value !== "") {
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
  }
  
  const scrollToTheBottom = () => {
    // @ts-ignore
    content.current.scrollToBottom();
  }

  useEffect(() => {
    if (token && chat)
      (async () => {
        setLoading(true);
        await loadMessages(chat.chatId, token);
        setLoading(false);
        scrollToTheBottom();
      })();
  }, [token, chat]);
  
  if (!chat || !userProfile) {
    return <div>Session not found</div>
  }
  
  return (
    <>
    {
      loading ? (
        <IonProgressBar type="indeterminate" />
      ) : (
        <IonPage id="session-detail-page">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonBackButton defaultHref="/tabs/matches"></IonBackButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
            <IonContent scrollEvents={true} ref={content}>
              <IonRow>
                
                <IonCol size="12" style={{"--ion-grid-column-padding": 0}}>
                  <IonList>
                    {
                      messages.map(message => (
                        <div className={`chat-bubble ${message.fromUserId === userProfile.userId?"sent":"recieved"}`}>
                          <IonText>
                            {message.content}
                          </IonText>
                        </div>
                      ))
                    }
                  </IonList>
                </IonCol>
              </IonRow>
            </IonContent>
            <IonFooter>
              <IonToolbar>
                <IonButton slot="end" fill="clear">
                  <IonIcon icon={send} />
                </IonButton>
                <IonInput placeholder="Send a message..." ref={value} onKeyDown={onKeyPressed}/>
              </IonToolbar>
            </IonFooter>
        </IonPage>
      )
    }
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
  component: withRouter(Chat)
});