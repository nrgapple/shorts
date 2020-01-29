import React, { useEffect, useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol, IonActionSheet, IonRefresher, IonRefresherContent } from '@ionic/react';
import SpeakerItem from '../components/SpeakerItem';
import { Speaker } from '../models/Speaker';
import { Session } from '../models/Session';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './SpeakerList.scss';
import { Profile } from '../models/Profile';
import MatchItem from '../components/MatchItem';
import { loadMatches, loadChats } from '../data/sessions/sessions.actions';
import { createChat } from '../data/dataApi';
import { RouteComponentProps } from 'react-router-dom';

interface OwnProps extends RouteComponentProps { 
  token?: string;
};

interface StateProps {
  matches?: Profile[]
};

interface DispatchProps {
  loadMatches: typeof loadMatches;
  loadChats: typeof loadChats;
};

interface MatchesListProps extends OwnProps, StateProps, DispatchProps { };

const MatchesList: React.FC<MatchesListProps> = ({ matches, token, loadMatches, history, loadChats }) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(undefined);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    loadMatches(token);
    loadChats(token);
  },[])

  const onSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowActionSheet(true);
  }

  const onCreateChat = async () => {
    if (token && selectedProfile) {
      try {
        setIsCreatingChat(true);
        const chat = await createChat(selectedProfile.userId, token);
        history.push(`/chat/${chat.chatId}`, {direction: 'none'});
      } catch (e) {
        console.log(`Could not create a chat: ${e}`);
      } finally {
        setIsCreatingChat(false);
      }
    }
  }

  return (
    <IonPage id="speaker-list">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Matches</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`outer-content`}>
        <IonRefresher slot="fixed" 
          onIonRefresh={(event: any) => {
            setTimeout(() => {
              matches = undefined; 
              loadMatches(token);
              event.detail.complete();
            }, 1000); 
          }}
          >
          <IonRefresherContent>
          </IonRefresherContent>
        </IonRefresher>
        <IonList lines="inset" inset>
          {matches ? (
            matches.map((match) => (
              <MatchItem profile={match} key={match.userId} onAction={onSelectProfile}></MatchItem>
            ))
          ) : (
            [undefined, undefined, undefined, undefined].map((match, key) => (
              <MatchItem key={key} profile={match} onAction={() => {}}></MatchItem>
            ))
          )} 
        </IonList>
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[{
            text: 'Profile',
            handler: () => {
              console.log(`See ${selectedProfile && selectedProfile.firstName}'s profile`);
            }, 
          }, {
            text: 'Chat',
            handler: () => {
              console.log(`Chat with ${selectedProfile && selectedProfile.firstName}`);
              onCreateChat();
            }
          }
        ]}
        ></IonActionSheet>
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    matches: selectors.getMatchesWithoutAChat(state),
    token: state.user.token,
  }),
  mapDispatchToProps: {
    loadMatches,
    loadChats
  },
  component: React.memo(MatchesList)
});