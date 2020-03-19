import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonContent, IonPage, IonButtons, IonBackButton, IonIcon, IonText, IonList, IonItem, IonLabel, IonTitle, IonProgressBar, IonRow, IonCol, IonCard } from '@ionic/react';
import { connect } from '../data/connect';
import { withRouter, RouteComponentProps } from 'react-router';
import * as selectors from '../data/selectors';
import { body, calendar, pin } from 'ionicons/icons';
import './ProfileDetail.scss';
import { loadNearMe, loadMatches } from '../data/sessions/sessions.actions';
import { Profile } from '../models/Profile';
import { calculateAge } from '../util/util';
import Lightbox from 'react-image-lightbox';
import ImageCard from '../components/ImageCard';
import InfoCard from '../components/InfoCard';


interface OwnProps extends RouteComponentProps { };

interface StateProps {
  profile?: Profile;
  token?: string;
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
  token,
}) => {

  const [bigImage, setBigImage] = useState<string | undefined>(undefined);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (token)
    {
      if (profile)
        return; 
      loadMatches(token);
      loadNearMe(token);
    }
  }, [token]);

  return (
    <IonPage id="session-detail-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home"></IonBackButton>
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {
          !profile ? (
            <IonProgressBar type="indeterminate" />
          ) : (
            <>
            <IonRow>
              <IonCol size="12" size-md="6">
                <ImageCard areDeletable={false} images={profile.images}/>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12" size-md="6">
                <InfoCard profile={profile}/>
              </IonCol>
            </IonRow>
          </>
          )
        }
      </IonContent>
    </IonPage>
  )
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state, OwnProps) => ({
    profile: selectors.getProfile(state, OwnProps),
    token: state.user.token,
  }),
  mapDispatchToProps: {
    loadNearMe,
    loadMatches,
  },
  component: withRouter(ProfileDetail)
})