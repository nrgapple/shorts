import React, { useEffect, useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol, IonActionSheet } from '@ionic/react';
import SpeakerItem from '../components/SpeakerItem';
import { Speaker } from '../models/Speaker';
import { Session } from '../models/Session';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './SpeakerList.scss';
import { Profile } from '../models/Profile';
import MatchItem from '../components/MatchItem';
import { loadMatches } from '../data/sessions/sessions.actions';

interface OwnProps { 
  token?: string;
};

interface StateProps {
  matches?: Profile[]
};

interface DispatchProps {
  loadMatches: typeof loadMatches;
};

interface MatchesListProps extends OwnProps, StateProps, DispatchProps { };

const MatchesList: React.FC<MatchesListProps> = ({ matches, token, loadMatches }) => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | undefined>(undefined)

  useEffect(() => {
    loadMatches(token);
  },[])

  const onSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowActionSheet(true);
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
    matches: state.data.matches,
    token: state.user.token,
  }),
  mapDispatchToProps: {
    loadMatches
  },
  component: React.memo(MatchesList)
});