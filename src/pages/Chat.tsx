import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonItem, IonLabel, IonInput, IonRow, IonCol, IonFooter } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { starOutline, star, share, cloudDownload, send, happy } from 'ionicons/icons';
import './Chat.scss';
import { Time } from '../components/Time';
import { addFavorite, removeFavorite } from '../data/sessions/sessions.actions';
import { Session } from '../models/Session';

interface OwnProps extends RouteComponentProps { };

interface StateProps {
  session?: Session;
  favoriteSessions: number[],
};

interface DispatchProps {
  addFavorite: typeof addFavorite;
  removeFavorite: typeof removeFavorite;
}

type ChatDetailProps = OwnProps & StateProps & DispatchProps;

const Chat: React.FC<ChatDetailProps> = ({ session, addFavorite, removeFavorite, favoriteSessions }) => {

  const content = useRef(null);
  const value = useRef(null);

  const scrollToBottom = () => {
    // @ts-ignore
    content.current.scrollToBottom();
  }

  const onKeyPressed = (event: any) => {
    // @ts-ignore
    if (event.keyCode == 13 && value.current.value !== "") {
      
      scrollToBottom();
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, []);
  
  if (!session) {
    return <div>Session not found</div>
  }
  
  return (
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
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble send">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
                <div className="chat-bubble received">
                  <IonText>
                    Here is some message
                  </IonText>
                </div>
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
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state, OwnProps) => ({
    session: selectors.getSession(state, OwnProps),
    favoriteSessions: state.data.favorites
  }),
  mapDispatchToProps: {
    addFavorite,
    removeFavorite
  },
  component: withRouter(Chat)
})