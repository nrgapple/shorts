import React from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonButton, IonIcon, IonText, IonList, IonItem, IonLabel, IonInput } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { starOutline, star, share, cloudDownload, send } from 'ionicons/icons';
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

  if (!session) {
    return <div>Session not found</div>
  }

  const isFavorite = favoriteSessions.indexOf(session.id) > -1;
  
  const toggleFavorite = () => { 
    isFavorite ? removeFavorite(session.id) : addFavorite(session.id);
  };
  const shareSession = () => { };
  const sessionClick = (text: string) => { 
    console.log(`Clicked ${text}`);
  };

  return (
    <IonPage id="session-detail-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/schedule"></IonBackButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => toggleFavorite()}>
              {isFavorite ?
                <IonIcon slot="icon-only" icon={star}></IonIcon> :
                <IonIcon slot="icon-only" icon={starOutline}></IonIcon>
              }
            </IonButton>
            <IonButton onClick={() => shareSession}>
              <IonIcon slot="icon-only" icon={share}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="main">
          <div className="chat-box">
            <div className="message-area">
              <div className="message">
              
              </div>
            </div>
            <div className="input-area">
              <form onSubmit={() => {}} name="messageForm">
                <IonInput type="text" name="message" id="message" placeholder="Say something nice..."/>
                <button>
                  <IonIcon icon={send} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
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