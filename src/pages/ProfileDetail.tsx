import React, { useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonTitle, IonProgressBar } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import './ProfileDetail.scss';
import { loadNearMe, loadMatches } from '../data/sessions/sessions.actions';
import { Profile } from '../models/Profile';
import InfoCard from '../components/InfoCard';


interface OwnProps extends RouteComponentProps { };

interface StateProps {
  profile?: Profile;
};

interface DispatchProps {
  loadNearMe: typeof loadNearMe,
  loadMatches: typeof loadMatches,
}

type ProfileDetailProps = OwnProps & StateProps & DispatchProps;

const ProfileDetail: React.FC<ProfileDetailProps> = ({
  loadNearMe,
  loadMatches,
  profile,
}) => {

  useEffect(() => {
    if (profile)
      return; 
    loadMatches();
    loadNearMe();
  }, []);

  return (
    <IonPage style={{overflow: 'scroll'}}>
      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/home"></IonBackButton>
            </IonButtons>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        {
        !profile ? (
          <IonProgressBar type="indeterminate" />
        ) : (
          <InfoCard profile={profile}/>
        )
        }
      </IonContent>
    </IonPage>
  )
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state, OwnProps) => ({
    profile: selectors.getProfile(state, OwnProps),
  }),
  mapDispatchToProps: {
    loadNearMe,
    loadMatches,
  },
  component: withRouter(ProfileDetail)
})