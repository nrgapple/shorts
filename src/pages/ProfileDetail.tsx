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
          <IonTitle>{profile&&`${profile.firstName} ${profile.lastName}`}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {
          !profile ? (
            <IonProgressBar type="indeterminate" />
          ) : (
            <>
            <IonRow>
              <ImageCard areDeletable={false} images={profile.images}/>
            </IonRow>
            <IonRow>
              <IonCol>
              <IonList lines="full">
                <IonItem>
                  <IonIcon icon={calendar} slot="start"></IonIcon>
                  <IonLabel>
                    <IonText color="primary">
                      <h2>Age</h2>
                    </IonText>
                    <h2>
                      {calculateAge(profile.dob)}
                    </h2> 
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonIcon icon={body} slot="start"></IonIcon>
                  <IonLabel>
                    <IonText color="primary">
                      <h2>
                        Height
                      </h2>
                    </IonText>

                    <h2>
                      {profile.height}
                    </h2>
                  </IonLabel>
                </IonItem>
              
                <IonItem>
                  <IonIcon icon={pin} slot="start"></IonIcon>
                  <IonLabel>
                    <IonText color="primary">
                      <h2>
                        Location
                      </h2>
                    </IonText>
                    <h2>
                      {profile.displayAddress}
                    </h2>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    <IonText color="primary">
                      <h2>About</h2>
                    </IonText>
                  </IonLabel>
                  <p>
                    {profile.about} jaskdf asdk fasd faskd kdafasdfasdf \n sadkjfals
                  </p>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
          </>
          )
        }
      </IonContent>
      {
        showImage && (
          <Lightbox
            mainSrc={bigImage?bigImage:''}
            onCloseRequest={() => setShowImage(false)}
          />
        )
      }
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