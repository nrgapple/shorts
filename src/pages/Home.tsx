import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol, IonCard, IonItem, IonText, IonRefresher, IonRefresherContent, IonButton } from '@ionic/react';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './Home.scss';
import { Profile } from '../models/Profile';
import ProfileCard from '../components/ProfileCard';
import { postSwipe } from '../data/dataApi';
import { incrementProfileIndex, loadNearMe } from '../data/sessions/sessions.actions';

interface OwnProps { 
  token?: string;
};

interface StateProps {
  profile?: Profile;
  nearMeCount: number;
  isLoggedin: boolean;
  hasValidProfile: boolean;
};

interface DispatchProps {
  incrementProfileIndex: typeof incrementProfileIndex;
  loadNearMe: typeof loadNearMe;
 };

interface HomeProps extends OwnProps, StateProps, DispatchProps { };

const Home: React.FC<HomeProps> = ({ profile, token, incrementProfileIndex: incrementProfileIndexAction, nearMeCount, isLoggedin, hasValidProfile }) => {

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
      {
        isLoggedin ? (
          <IonContent className="">
            <IonRefresher slot="fixed" 
              onIonRefresh={(event: any) => {
                setTimeout(() => {
                  profile = undefined; 
                  loadNearMe();
                  event.detail.complete();
                }, 1000); 
              }}
            >
              <IonRefresherContent>
                <IonContent style={{width:"100%", height:"100%"}}></IonContent>
              </IonRefresherContent>
            </IonRefresher>
            <IonList>
              <IonGrid fixed>
                <IonRow justify-content-center align-items-center>
                  <IonCol>
                    {
                      !hasValidProfile ? (
                        <IonCard>
                            <IonButton color="danger" expand="block" routerLink={"/profile"}>
                              <IonText>
                                Finish your profile
                              </IonText>
                            </IonButton>
                          </IonCard>
                      ) : (
                        <>
                        { nearMeCount !== 0 ? (
                          <ProfileCard profile={profile} swiped={swipe}/>
                        ) : (
                          <IonCard>
                            <IonItem>
                              <IonText color="danger">
                                No Matches in your area. Pull down to refresh or change your distance.
                              </IonText>
                            </IonItem>
                          </IonCard>
                        )
                        }
                        </>
                      )
                    }
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonList>
          </IonContent>

        ) : (
          <IonContent>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonButton expand="block" routerLink={"/Login"}>
                    <IonText>
                      Please Login
                    </IonText>
                  </IonButton>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonContent>
        )
      }
  </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    profile : selectors.getCurrentProfile(state),
    token: state.user.token,
    nearMeCount: state.data.nearMe?state.data.nearMe.length: -1,
    isLoggedin: state.user.isLoggedin,
    hasValidProfile: state.user.hasValidProfile,
  }),
  mapDispatchToProps: {
    incrementProfileIndex,
    loadNearMe,
  },
  component: Home
});