import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonButton, IonIcon, IonDatetime, IonSelectOption, IonList, IonItem, IonLabel, IonSelect, IonPopover, IonProgressBar, IonPicker, IonText, IonInput, IonRow, IonCol, IonTextarea, IonToast, IonFab, IonFabButton } from '@ionic/react';
import './About.scss';
import { calendar, pin, more, body, fastforward } from 'ionicons/icons';
import { Profile } from '../models/Profile';
import { Image } from "../models/Image";
import { connect } from '../data/connect';
import EditPopover from '../components/EditPopover';
import Axios from 'axios';
import { setUserProfile } from '../data/sessions/sessions.actions';
import { Camera, CameraResultType } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader'
const apiURL = 'https://doctornelson.herokuapp.com';

interface OwnProps { 
  userProfile?: Profile;
  token?: string;
};

interface StateProps {
  loading?: boolean;
};

interface DispatchProps { };

interface UserProfileProps extends OwnProps, StateProps, DispatchProps {};

const About: React.FC<UserProfileProps> = ({ userProfile, loading, token }) => {
  const [about, setAbout] = useState(userProfile && userProfile.about? userProfile.about: 'empty');
  const [height, setHeight] = useState(userProfile && userProfile.height? userProfile.height: 0);
  const [gender, setGender] = useState(userProfile && userProfile.gender? userProfile.gender: 'male');
  const [genderPref, setGenderPref] = useState(userProfile && userProfile.genderPref? userProfile.genderPref: 'male');
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState();
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState(userProfile && userProfile.images?userProfile.images.map(i => i.imageUrl): [])

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

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.trace('updating profile submit');
    if (!token)
    return;
    try {
      const response = await Axios.request({
        url: `${apiURL}/secure/profile`,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data: {
            about: about,
            gender: gender.toUpperCase(),
            genderPref: genderPref.toUpperCase(),
            height: height,
          }
      });
      const {data} = response;
      console.log(data);
      const updatedProfile = {
        userId: data.userId as number, 
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        about: data.about as string,
        height: data.height as number,
        dob: data.dob as Date,
        username: data.username as string,
        gender: data.gender.toLowerCase() as string,
        genderPref: data.genderPref.toLowerCase() as string,
        images: data.images.map((image: any) : Image => {
          return {
            imageId: image.imageId,
            imageUrl: image.imageUrl,
          }
        }),
      } as Profile;

      await setUserProfile(updatedProfile);
      setIsEditing(false);
      setToastText('Profile Updated Successfully');
      setShowToast(true);
    } catch (e) {
      const { data } = await e.response;
      console.error(`Error updating profile`);
      console.error(data);
      setToastText('Error Updating Profile');
      setShowToast(true);
    }
  }

  const takePicture = async () => {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri
    });

    var imageUrl = image.webPath;
    if (imageUrl ) {
      setImages([...images, imageUrl]);
    } else {
      console.log(`No image uploaded`);
    }
  }

  useEffect(() => {
    console.log('currentUserProfile');
    console.log(userProfile);
    setAbout(userProfile && userProfile.about? userProfile.about: 'empty');
    setHeight(userProfile && userProfile.height? userProfile.height: 0);
    setGenderPref(userProfile && userProfile.genderPref? userProfile.genderPref: 'male');
    setGender(userProfile && userProfile.gender? userProfile.gender: 'male');
    setImages(userProfile && userProfile.images?userProfile.images.map(i => i.imageUrl): []);
    defineCustomElements(window);
  }, [userProfile])

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
                <IonInput disabled={!isEditing} type="number" value={height.toString()} onIonChange={e => setHeight(Number.parseInt(e.detail.value? e.detail.value : '0'))}>
                </IonInput>
              </IonItem>
              
              <IonItem>
                <IonIcon icon={body} slot="start"></IonIcon>
                <IonLabel position="stacked">Gender</IonLabel>
                <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)} disabled={!isEditing}>
                  <IonSelectOption value="female">Female</IonSelectOption>
                  <IonSelectOption value="male">Male</IonSelectOption>
                </IonSelect>
              </IonItem>
              
              <IonItem>
                <IonIcon icon={body} slot="start"></IonIcon>
                <IonLabel position="stacked">Gender Preference</IonLabel>
                <IonSelect value={genderPref} onIonChange={e => setGender(e.detail.value)} disabled={!isEditing}>
                  <IonSelectOption value="female">Female</IonSelectOption>
                  <IonSelectOption value="male">Male</IonSelectOption>
                </IonSelect>
              </IonItem>
                
              <IonItem>
                <IonIcon icon={pin} slot="start"></IonIcon>
                <IonLabel position="stacked">Location</IonLabel>
                <IonText>Placeholder</IonText>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">About</IonLabel>
                  <IonTextarea value={about} disabled={!isEditing} onIonChange={e=> setAbout(e.detail.value!)} autoGrow spellCheck={true}></IonTextarea>
              </IonItem>
            </IonList>
            
            {
              isEditing ?
              <IonRow>
                <IonCol>
                  <IonButton type="submit" expand="block">Update</IonButton>
                </IonCol>
                <IonCol>
                  <IonButton onClick={() => {setIsEditing(false);}} color="light" expand="block">Cancel</IonButton>
                </IonCol>
              </IonRow>
              :
            <></>
            }
            </form>
          </div>
          
          </>
        }
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => takePicture()} >
            <IonIcon color="secondary" name="add"></IonIcon>
          </IonFabButton>
        </IonFab>
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
      <IonToast
        isOpen={showToast}
        duration={3000}
        message={toastText}
        onDidDismiss={() => setShowToast(false)} />
      
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    userProfile: state.data.userProfile,
    loading: state.data.loading,
    token: state.user.token
  }),
  component: About
});