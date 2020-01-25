import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol } from '@ionic/react';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './Home.scss';
import { Profile } from '../models/Profile';
import ProfileCard from '../components/ProfileCard';
import { postSwipe } from '../data/dataApi';
import { incrementProfileIndex } from '../data/sessions/sessions.actions';

interface OwnProps { 
  token?: string;
};

interface StateProps {
  profile?: Profile;
};

interface DispatchProps {
  incrementProfileIndex: typeof incrementProfileIndex;
 };

interface HomeProps extends OwnProps, StateProps, DispatchProps { };

const Home: React.FC<HomeProps> = ({ profile, token, incrementProfileIndex: incrementProfileIndexAction }) => {

  const [currentMatch, setCurrentMatch] = useState(profile);
  const [showMatch, setShowMatch] = useState(false);

  const swipe = async (liked: boolean) => {
    console.log(`Handling swipe`);
    if (!profile) {
      console.log(`No user to like`); 
      return;
    }

    try {
      const isMatch = await postSwipe(profile.userId, liked, token);

      if (!isMatch === undefined) {
        console.log(`incorrect data returned.`);
      }

      if (isMatch) {
        console.log(`You got a match!`);
        setCurrentMatch(profile);
      } else { 
        console.log(`No match yet cuz isMatch: ${isMatch}`);
      }
      
      incrementProfileIndexAction();
    } catch (e) {
      console.log(e);
      if (e.message === "Already swiped user") {
        console.log(`Already swiped this user. Moving to the next.`);
        incrementProfileIndexAction();
      }
    }
  }

  return (
    <IonPage id="home">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><span><img src="/assets/icon/shorts-24.ico" alt="Logo"></img></span></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="">
        <IonList>
          <IonGrid fixed>
            <IonRow justify-content-center align-items-center>
              <IonCol>
                <ProfileCard profile={profile} swiped={swipe}/>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonList>
      </IonContent>
  </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    profile : selectors.getCurrentProfile(state),
    token: state.user.token,
  }),
  mapDispatchToProps: {
    incrementProfileIndex
  },
  component: Home
});