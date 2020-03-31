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
import { homeMachine, swipeMachine } from '../machines/homeMachines';
import { Swipeable, direction } from 'react-deck-swiper';

interface OwnProps {
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
  const [homeState, homeSend, homeService] = useMachine(homeMachine, {
    actions: {
      fetchData: () => {
        loadNearMe()
      },
    }
  });
  const [swipeState, swipeSend] = useMachine(swipeMachine, {
    actions: {
      onPass: () => swipe(false),
      onLike: () => swipe(true),
      onMatch: () => {swipeSend('DISMISS');},
      onNext: () => {
        incrementProfileIndexAction();
        setTimeout(() => {
          swipeSend('SUCCESS');
        }, 200);
      },
      next: () => {
        if (!profile) {
          homeSend('RESET');
          init();
        }
      }
    }
  });

  const init = () => {
    if (!homeState.matches('start'))
      homeSend('RESET');
    if (!isLoggedin) {
      homeSend('NOT_LOGGED_IN');
      return;
    }
    if (userProfile && homeSend) {
      homeSend('LOAD');
    }
  }

  useEffect(() => {
    init();
  }, [userProfile, isLoggedin, homeSend, hasValidProfile]);

  useEffect(() => {
    if (homeState.matches('loading')) {
      if (loading === true) {
        return;
      }
      if (!hasValidProfile) {
        homeSend('FOUND_NO_USER_PROFILES');
        return;
      }
      if (nearMeCount > 0) {
        homeSend('LOADED_MATCHES'); 
      } else {
        homeSend('LOADED_NOTHING');
      }
    }
  }, [nearMeCount, profile, loading, profile])

  useEffect(() => {
    const subscription = homeService.subscribe(state => {
    });
  
    return subscription.unsubscribe;
  }, [homeService]); // note: service should never change

  const swipe = async (liked: boolean) => {
    if (!profile) {
      return;
    }

    try {
      const isMatch = await postSwipe(profile.userId, liked);
      if (!isMatch === undefined) {
        swipeSend('SUCCESS');
      }
      if (isMatch) {
        setCurrentMatch(profile);
        swipeSend('GOT_MATCH');
      } else {
        swipeSend('SUCCESS')
      }
    } catch (e) {
      if (e.message === "Already swiped user") {
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
            homeSend({type: 'LOAD', action: 'fetchData'});
            setTimeout(() => {
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
              <IonCol size="12" size-md="6">
                <IonCard>
                  <IonButton color="danger" expand="block" routerLink={"/profile"}>
                    <IonText>
                      Finish your profile
                    </IonText>
                  </IonButton>
                </IonCard>
              </IonCol>
            ) : homeState.matches('matches') ? (
              <>
              {
                swipeState.matches('idle') && 
                  <Swipeable onSwipe={(choice: direction) => swipeSend(choice === direction.RIGHT?'SWIPED_RIGHT':'SWIPED_LEFT')}>
                    <ProfileCard profile={profile} swiped={(choice: boolean) => swipeSend(choice?'SWIPED_RIGHT':'SWIPED_LEFT')} />
                  </Swipeable>
                }
              </>
            ) : homeState.matches('loading') ? (
              <div></div>
            ) : homeState.matches('noMatches') ? (
              <IonCol size="12" size-md="6">
                <IonCard>
                  <IonItem>
                    <IonText color="danger">
                      No Matches in your area. Pull down to refresh or change your distance.
                    </IonText>
                  </IonItem>
                </IonCard>
              </IonCol>
            ) : homeState.matches('notLoggedIn') ? (
              <IonCol size="12" size-md="6">
                <IonCard>
                  <IonButton expand="block" routerLink={"/Login"}>
                    <IonText>
                      Please Login
                    </IonText>
                  </IonButton>
                </IonCard>
              </IonCol>
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