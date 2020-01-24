import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonButton, IonIcon, IonDatetime, IonSelectOption, IonList, IonItem, IonLabel, IonSelect, IonPopover, IonProgressBar, IonPicker, IonText, IonInput, IonRow, IonCol, IonTextarea } from '@ionic/react';
import './About.scss';
import { calendar, pin, more, body, fastforward } from 'ionicons/icons';
import { Profile } from '../models/Profile';
import { connect } from '../data/connect';
import EditPopover from '../components/EditPopover';

interface OwnProps { 
  userProfile?: Profile;
};

interface StateProps {
  loading?: boolean
};

interface DispatchProps { };

interface UserProfileProps extends OwnProps, StateProps, DispatchProps {};

const About: React.FC<UserProfileProps> = ({ userProfile, loading }) => {
  const [about, setAbout] = useState(userProfile && userProfile.about? userProfile.about: 'empty');
  const [height, setHeight] = useState(userProfile && userProfile.height? userProfile.height: 0);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState();
  const [update, setHeightUpdated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const updateProfile = (e: React.FormEvent) => {
    e.preventDefault();
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
            {
              !isEditing?
              <IonButton icon-only onClick={presentPopover}>
                <IonIcon slot="icon-only" icon={more}></IonIcon>
              </IonButton>
              :
              <></>
            }
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {
          loading ? 
          <IonProgressBar type="indeterminate"></IonProgressBar>
          :
          <>
          <div className="about-header">
            <img src={userProfile && userProfile.images && userProfile.images.length > 0 && userProfile.images[0]? userProfile.images[0].imageUrl:"assets/img/ionic-logo-white.svg"} alt="ionic logo" />
          </div>
          <div className="about-info">
            <h4 className="ion-padding-start">
              {userProfile? `${userProfile.firstName} ${userProfile.lastName}`: 'No Profile'}
            </h4>
            <form noValidate onSubmit={updateProfile}>
            <IonList lines="none">
              <IonItem>
                <IonIcon icon={calendar} slot="start"></IonIcon>
                <IonLabel position="stacked">Age</IonLabel>
                <IonText>
                  {userProfile? calculateAge(userProfile.dob) : 'N/A'}
                </IonText> 
              </IonItem>

              <IonItem>
                <IonIcon icon={body} slot="start"></IonIcon>
                <IonLabel position="stacked">Height</IonLabel>
                {
                  isEditing ?
                  <IonInput type="number" value={height.toString()} onIonChange={e => setHeight(Number.parseInt(e.detail.value? e.detail.value : '0'))}>
                  </IonInput>
                  :
                  <IonText>
                    {userProfile && userProfile.height? userProfile.height : 'N/A'}
                  </IonText> 
                }
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

              <IonItem>
                <IonLabel position="stacked">About</IonLabel>
                {
                  isEditing ?
                  <IonTextarea value={about} onIonChange={e=> setAbout(e.detail.value!)} autoGrow spellCheck={true}></IonTextarea>
                  :
                  <p>
                    {userProfile && userProfile.about? userProfile.about: ''}
                  </p>
                }
               
              </IonItem>
            </IonList>
            
            
            </form>
          </div>
          {
            isEditing ?
            <IonRow>
              <IonCol>
                <IonButton type="submit" expand="block">Update</IonButton>
              </IonCol>
              <IonCol>
                <IonButton onClick={() => {setIsEditing(false); setAbout(userProfile && userProfile.about? userProfile.about: '')}} color="light" expand="block">Cancel</IonButton>
              </IonCol>
            </IonRow>
            :
            <></>
          }
          </>
        }
      </IonContent>
      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
      >
        <EditPopover edit={() => {
              setIsEditing(true); 
              setShowPopover(false);
            }
          }
        /> 
      </IonPopover>
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    userProfile: state.data.userProfile,
    loading: state.data.loading
  }),
  component: About
});