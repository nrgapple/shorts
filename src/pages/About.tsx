import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonButton, IonIcon, IonDatetime, IonSelectOption, IonList, IonItem, IonLabel, IonSelect, IonPopover } from '@ionic/react';
import './About.scss';
import { calendar, pin, more, body } from 'ionicons/icons';
import AboutPopover from '../components/AboutPopover';
import { Profile } from '../models/Profile';
import { connect } from '../data/connect';

interface OwnProps { 
  userProfile?: Profile;
};

interface StateProps {};

interface DispatchProps { };

interface UserProfileProps extends OwnProps, StateProps, DispatchProps {};

const About: React.FC<UserProfileProps> = ({ userProfile }) => {

  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState();

  const presentPopover = (e: React.MouseEvent) => {
    setPopoverEvent(e.nativeEvent);
    setShowPopover(true);
  };

  const calculateAge = (dob: Date) => {
    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }
    return age;
  }

  return (
    <IonPage id="about-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton icon-only onClick={presentPopover}>
              <IonIcon slot="icon-only" icon={more}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <div className="about-header">
          <img src={userProfile && userProfile.images && userProfile.images.length > 0 && userProfile.images[0]? userProfile.images[0].imageUrl:"assets/img/ionic-logo-white.svg"} alt="ionic logo" />
        </div>
        <div className="about-info">
          <h4 className="ion-padding-start">
            {userProfile? `${userProfile.firstName} ${userProfile.lastName}`: 'No Profile'}
          </h4>

          <IonList lines="none">
            <IonItem>
              <IonIcon icon={calendar} slot="start"></IonIcon>
              <IonLabel position="stacked">Age</IonLabel>
              <IonLabel position="stacked">
                {userProfile? calculateAge(userProfile.dob) : 'N/A'}
              </IonLabel> 
            </IonItem>

            <IonItem>
              <IonIcon icon={body} slot="start"></IonIcon>
              <IonLabel position="stacked">Height</IonLabel>
              <IonLabel position="stacked">
                {userProfile && userProfile.height? userProfile.height : 'N/A'}
              </IonLabel> 
            </IonItem>

            <IonItem>
              <IonIcon icon={pin} slot="start"></IonIcon>
              <IonLabel position="stacked">Location</IonLabel>
              <IonSelect>
                <IonSelectOption value="madison" selected>Madison, WI</IonSelectOption>
                <IonSelectOption value="austin">Austin, TX</IonSelectOption>
                <IonSelectOption value="chicago">Chicago, IL</IonSelectOption>
                <IonSelectOption value="seattle">Seattle, WA</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>

          <p className="ion-padding-start ion-padding-end">
            {userProfile && userProfile.about? userProfile.about : ''}
          </p>
        </div>
      </IonContent>
      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
      >
        <AboutPopover dismiss={() => setShowPopover(false)} /> 
      </IonPopover>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    userProfile: state.data.userProfile
  }),
  component: About
});