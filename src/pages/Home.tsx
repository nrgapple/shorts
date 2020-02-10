import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react'
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol, IonCard, IonItem, IonText, IonRefresher, IonRefresherContent, IonButton, IonItemSliding, IonItemOptions, IonItemOption, IonIcon } from '@ionic/react';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './Home.scss';
import { Profile } from '../models/Profile';
import ProfileCard from '../components/ProfileCard';
import { postSwipe, getNearMe } from '../data/dataApi';
import { incrementProfileIndex, loadNearMe } from '../data/sessions/sessions.actions';
import { close, heart } from 'ionicons/icons';
import { homeMachine, swipeMachine } from '../machines/homeMachines';

interface OwnProps {
  token?: string;
};

interface StateProps {
  profile?: Profile;
  nearMeCount: number;
  isLoggedin: boolean;
  hasValidProfile: boolean;
  userProfile?: Profile;
  loading?: boolean;
};

interface DispatchProps {
  incrementProfileIndex: typeof incrementProfileIndex;
  loadNearMe: typeof loadNearMe;
};

interface HomeProps extends OwnProps, StateProps, DispatchProps { };

const Home: React.FC<HomeProps> = ({
  profile,
  token,
  incrementProfileIndex: incrementProfileIndexAction,
  nearMeCount,
  loadNearMe,
  isLoggedin,
  hasValidProfile,
  userProfile,
  loading,
}) => {

  const [currentMatch, setCurrentMatch] = useState(profile);
  const [showMatch, setShowMatch] = useState(false);
  const [homeState, homeSend] = useMachine(homeMachine, {
    actions: {
      load: () => {
        console.log('entry to loading nearme');
        loadNearMe(token)
      },
    }
  });
  const [swipeState, swipeSend] = useMachine(swipeMachine);

  useEffect(() => {
    console.log(`loading near me.`);
    console.log(homeState.value);
    if (isLoggedin && token && userProfile && homeSend) {
      homeSend('LOAD');
      console.log('move to loading');
    }
  }, [userProfile, isLoggedin, token, homeSend]);

  useEffect(() => {
    console.log(`Home state: ${homeState.value}`)
    if (homeState.matches('loading')) {
      if (loading === true) {
        console.log('loading still');
        return;
      }
      console.log('in loading state');
      if (!hasValidProfile) {
        console.log('hasValidProfile')
        homeSend('FOUND_NO_USER_PROFILES');
        return;
      }
      if (nearMeCount > 0) {
        console.log('matches!')
        homeSend('LOADED_MATCHES'); 
      } else {
        console.log('no matches');
        homeSend('LOADED_NOTHING');
      }
    }
  }, [nearMeCount, profile, loading, profile])

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
        <IonRefresher slot="fixed"
          onIonRefresh={(event: any) => {
            setTimeout(() => {
              profile = undefined;
              loadNearMe(token);
              event.detail.complete();
            }, 1000);
          }}
        >
          <IonRefresherContent>
          </IonRefresherContent>
        </IonRefresher>
        <IonRow>
          {
            homeState.matches('unFinishedProfile') ? (
              <IonCard>
                <IonButton color="danger" expand="block" routerLink={"/profile"}>
                  <IonText>
                    Finish your profile
                  </IonText>
                </IonButton>
              </IonCard>
            ) : homeState.matches('matches') ? (
              <>
                <ProfileCard profile={profile} swiped={swipe} />
              </>
            ) : homeState.matches('matches') ? (
              <IonCard>
                <IonItem>
                  <IonText color="danger">
                    No Matches in your area. Pull down to refresh or change your distance.
                  </IonText>
                </IonItem>
              </IonCard>
            ) : homeState.matches('loading') ? (
              <IonCard>
                <IonButton expand="block" routerLink={"/Login"}>
                  <IonText>
                    Please Login
                  </IonText>
                </IonButton>
              </IonCard>
            ) : null
          }
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    profile: selectors.getCurrentProfile(state),
    token: state.user.token,
    nearMeCount: state.data.nearMe ? state.data.nearMe.length : -1,
    isLoggedin: state.user.isLoggedin,
    hasValidProfile: state.data.hasValidProfile,
    userProfile: state.data.userProfile,
    loading: state.data.loading,
  }),
  mapDispatchToProps: {
    incrementProfileIndex,
    loadNearMe,
  },
  component: Home
});