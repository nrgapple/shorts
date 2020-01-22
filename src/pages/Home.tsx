import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonList, IonGrid, IonRow, IonCol } from '@ionic/react';
import { connect } from '../data/connect';
import * as selectors from '../data/selectors';
import './Home.scss';
import { Profile } from '../models/Profile';
import ProfileCard from '../components/ProfileCard';

interface OwnProps { };

interface StateProps {
  profile?: Profile;
};

interface DispatchProps { };

interface HomeProps extends OwnProps, StateProps, DispatchProps { };

const Home: React.FC<HomeProps> = ({ profile }) => {

  return (
    <IonPage id="home">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      {profile?
        <>
        <IonContent className="">
          <IonList>
            <IonGrid fixed>
              <IonRow justify-content-center align-items-center>
                <IonCol>
                  <ProfileCard profile={profile}/>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonList>
        </IonContent>
        </>
        :
        <></>
      }
  </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    profile : selectors.getCurrentProfile(state)
  }),
  component: React.memo(Home)
});