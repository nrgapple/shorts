import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol } from '@ionic/react';
import SpeakerItem from '../components/SpeakerItem';
import { Speaker } from '../models/Speaker';
import { Session } from '../models/Session';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './SpeakerList.scss';
import { Profile } from '../models/Profile';
import MatchItem from '../components/MatchItem';

interface OwnProps { 
  token?: string;
};

interface StateProps {
  matches?: Profile[]
};

interface DispatchProps { };

interface MatchesListProps extends OwnProps, StateProps, DispatchProps { };

const MatchesList: React.FC<MatchesListProps> = ({ matches,  }) => {

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
        <IonList>
          <IonGrid fixed>
            <IonRow align-items-stretch>
              {matches?matches.map((match, key) => (
                <IonCol size="12" size-md="6" key={key}>
                  <MatchItem profile={match}></MatchItem>
                </IonCol>
              )) : (
                [undefined, undefined, undefined, undefined].map((match, key) => (
                  <IonCol size="12" size-md="6" key={key}>
                    <MatchItem profile={match}></MatchItem>
                  </IonCol>
                ))
              )} 
            </IonRow>
          </IonGrid>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    matches: state.data.matches,
    token: state.user.token,
  }),
  component: React.memo(MatchesList)
});