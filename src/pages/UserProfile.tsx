import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonButton, IonIcon, IonSelectOption, IonList, IonItem, IonLabel, IonSelect, IonPopover, IonProgressBar, IonText, IonInput, IonRow, IonCol, IonTextarea, IonToast, IonFab, IonFabButton, IonCard, IonRange, IonCardContent, IonChip, IonCardHeader, IonCardTitle, IonItemDivider } from '@ionic/react';
import './UserProfile.scss';
import { calendar, pin, more, body, close, male, female } from 'ionicons/icons';
import { Profile } from '../models/Profile';
import { Image } from "../models/Image";
import { connect } from '../data/connect';
import EditPopover from '../components/EditPopover';
import Axios from 'axios';
import { setUserProfile, loadProfile, loadNearMe, setHasValidProfile } from '../data/sessions/sessions.actions';
import { defineCustomElements } from '@ionic/pwa-elements/loader'
import { postImage, postProfileInfo } from '../data/dataApi';
import Lightbox from 'react-image-lightbox';
import ImageCard from '../components/ImageCard';
import { userInfo } from 'os';
const apiURL = 'https://doctornelson.herokuapp.com';

interface OwnProps {
  userProfile?: Profile;
  token?: string;
};

interface StateProps {
  loading?: boolean;
  isloggedin: boolean;
};

interface DispatchProps {
  loadProfile: typeof loadProfile,
  loadNearMe: typeof loadNearMe,
  setHasValidProfile: typeof setHasValidProfile,
};

interface UserProfileProps extends OwnProps, StateProps, DispatchProps { };

const About: React.FC<UserProfileProps> = ({
  userProfile,
  loading,
  token,
  loadProfile,
  isloggedin,
  setHasValidProfile,
}) => {
  const [about, setAbout] = useState(userProfile && userProfile.about ? userProfile.about : 'empty');
  const [height, setHeight] = useState(userProfile && userProfile.height ? userProfile.height : 0);
  const [gender, setGender] = useState(userProfile && userProfile.gender ? userProfile.gender : 'male');
  const [genderPref, setGenderPref] = useState(userProfile && userProfile.genderPref ? userProfile.genderPref : 'male');
  const [distance, setDistance] = useState(userProfile && userProfile.searchMiles ? userProfile.searchMiles : -1);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState();
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState(userProfile && userProfile.images ? userProfile.images : [])
  const [inputImage, setInputImage] = useState<File | undefined>(undefined);
  const [showImage, setShowImage] = useState(false);
  const [bigImage, setBigImage] = useState<string | undefined>(undefined);

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
    try {
      const updatedProfile = await postProfileInfo(
        token,
        about,
        gender,
        genderPref,
        height,
        distance,
      ) as Profile;
      console.log(updatedProfile);
      setUserProfile(updatedProfile);
      setHasValidProfile(true);
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

  const uploadImage = async () => {
    if (inputImage) {
      try {
        const imageInfo = await postImage(inputImage, token);
        if (imageInfo) {
          setImages([...images, imageInfo]);
          setToastText('Image Uploaded Successfully');
          setShowToast(true);
        }
      } catch (e) {
        console.log(`Error uploading image: ${e}`);
      }
    } else {
      console.log(`No image to upload`);
    }
  }

  const removeImage = async (imageId: number | undefined) => {
    console.log(`Remove image: ${imageId}`);
    if (!imageId) {
      return;
    }
    try {
      const index = images.findIndex(x => x.imageId === imageId);
      console.log(images.length);
      images.length < 2 ?
        setImages(oldImages => [] as Image[]) :
        setImages(oldImages => [...oldImages.slice(0, index), ...oldImages.slice(index + 1)]);
      console.log(images);
      setToastText('Image removed successfully');
      setShowToast(true);
    } catch (e) {
      console.log(`There was an issue deleting the image`);
    }
  }

  const handeChange = (event: any) => {
    const file = event.target.files[0] as File;
    setInputImage(file);
  }

  const setValues = () => {
    console.log('currentUserProfile');
    console.log(userProfile);
    setAbout(userProfile && userProfile.about ? userProfile.about : 'empty');
    setHeight(userProfile && userProfile.height ? userProfile.height : 0);
    setGenderPref(userProfile && userProfile.genderPref ? userProfile.genderPref : 'male');
    setGender(userProfile && userProfile.gender ? userProfile.gender : 'male');
    setImages(userProfile && userProfile.images ? userProfile.images : []);
    setDistance(userProfile && userProfile.searchMiles ? userProfile.searchMiles : 10);
    defineCustomElements(window);
  }

  useEffect(() => {
    console.log('userProfile updated');
    setValues();
  }, [userProfile])

  useEffect(() => {
    console.log('start about');
    try {
      console.log(`token ${token}`)
      loadProfile(token);
    } catch (e) {
      console.log(`Error loading the user profile ${e}`);
    }

  }, []);

  return (
    <IonPage id="about-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      {
        isloggedin && userProfile ? (
          <IonContent>
            {
              loading || !userProfile ?
                <IonProgressBar type="indeterminate"></IonProgressBar>
                :
                <>
                  <IonRow>
                    <IonCol size="12">
                      <ImageCard
                        images={images}
                        areDeletable={isEditing}
                        onDelete={removeImage}
                      />

                    </IonCol>
                    {
                      isEditing && (
                        <>
                          <IonCol size="12" size-md="6">
                            <IonCard>
                              <input type="file" accept="image/png, image/jpeg" name="image-upload" onChange={handeChange}></input>
                              {
                                inputImage && (
                                  <IonButton onClick={uploadImage}>
                                    Upload
                            </IonButton>
                                )
                              }
                            </IonCard>
                          </IonCol>
                        </>
                      )
                    }
                  </IonRow>
                  <form noValidate onSubmit={updateProfile}>
                    <IonRow>
                      <IonCol size="12">
                        <IonCard>
                          <IonCardHeader translucent>
                            <IonCardTitle>
                              {userProfile.firstName}
                            </IonCardTitle>
                          </IonCardHeader>
                          {
                            !isEditing ?
                              <>
                                <IonCardContent class="outer-content">
                                  <IonChip color="primary" outline>
                                    <IonIcon icon={calendar} />
                                    <IonLabel>
                                      {calculateAge(userProfile.dob)}
                                    </IonLabel>
                                  </IonChip>
                                  <IonChip color="secondary" outline>
                                    <IonIcon icon={body} />
                                    <IonLabel>
                                      {userProfile.height}
                                    </IonLabel>
                                  </IonChip>
                                  <IonChip color="primary" outline>
                                    <IonLabel>
                                      Gender
                                  </IonLabel>
                                    {
                                      userProfile.gender === 'male' ?
                                        <IonIcon icon={male} />
                                        :
                                        <IonIcon icon={female} />
                                    }
                                  </IonChip>
                                  <IonChip color="primary" outline>
                                    <IonLabel>
                                      Looking For
                                  </IonLabel>
                                    {
                                      userProfile.genderPref === 'male' ?
                                        <IonIcon icon={male} />
                                        :
                                        <IonIcon icon={female} />
                                    }
                                  </IonChip>
                                  <IonChip color="primary" outline>
                                    <IonIcon icon={pin} />
                                    <IonLabel>
                                      {userProfile.displayAddress}
                                    </IonLabel>
                                  </IonChip>
                                </IonCardContent>
                                <IonCardContent>
                                  <p className="ion-padding-start ion-padding-end">
                                    {userProfile.about}
                                  </p>
                                </IonCardContent>
                              </>
                              :
                              <IonList lines="none">
                                <IonItemDivider>
                                  <IonLabel>
                                    Height
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonInput
                                    type="number"
                                    value={height.toString()}
                                    inputMode="numeric"
                                    min="30"
                                    max="50"
                                    step="1"
                                    onIonChange={e => setHeight(Number.parseInt(e.detail.value ? e.detail.value : '0'))}>
                                  </IonInput>
                                </IonItem>
                                <IonItemDivider>
                                  <IonLabel>
                                    Gender
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonSelect value={gender} onIonChange={e => setGender(e.detail.value)}>
                                    <IonSelectOption value="female">Female</IonSelectOption>
                                    <IonSelectOption value="male">Male</IonSelectOption>
                                  </IonSelect>
                                </IonItem>
                                <IonItemDivider>
                                  <IonLabel>
                                    Looking For
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonSelect value={genderPref} onIonChange={e => setGenderPref(e.detail.value)}>
                                    <IonSelectOption value="female">Female</IonSelectOption>
                                    <IonSelectOption value="male">Male</IonSelectOption>
                                  </IonSelect>
                                </IonItem>
                                <IonItemDivider>
                                  <IonLabel>
                                    Look Distance (miles)
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonRange step={5} min={1} max={500} pin value={distance} onIonChange={e => setDistance(e.detail.value as number)}>
                                    <IonLabel slot="start">1</IonLabel>
                                    <IonLabel slot="end">500</IonLabel>
                                  </IonRange>
                                </IonItem>
                                <IonItemDivider>
                                  <IonLabel>
                                    About
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonTextarea value={about} onIonChange={e => setAbout(e.detail.value!)} autoGrow spellCheck={true}></IonTextarea>
                                </IonItem>
                              </IonList>
                          }
                        </IonCard>
                      </IonCol>
                    </IonRow>
                    {
                      isEditing &&
                      <IonRow>
                        <IonCol>
                          <IonButton type="submit" expand="block">Update</IonButton>
                        </IonCol>
                        <IonCol>
                          <IonButton onClick={() => { setIsEditing(false); }} color="light" expand="block">Cancel</IonButton>
                        </IonCol>
                      </IonRow>
                    }
                    </form>
                    {
                      !isEditing &&
                      <IonCol>
                        <IonButton expand="block" onClick={() => setIsEditing(true)}>Edit</IonButton>
                      </IonCol>
                    }
                </>
            }
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
      <IonToast
        isOpen={showToast}
        duration={3000}
        message={toastText}
        onDidDismiss={() => setShowToast(false)} />
      {
        showImage && (
          <Lightbox
            mainSrc={bigImage ? bigImage : ''}
            onCloseRequest={() => setShowImage(false)}
          />
        )
      }
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    userProfile: state.data.userProfile,
    loading: state.data.loading,
    token: state.user.token,
    isloggedin: state.user.isLoggedin,
  }),
  mapDispatchToProps: {
    loadProfile,
    loadNearMe,
    setHasValidProfile,
  },
  component: About
});