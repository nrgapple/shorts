import React, { useState, useEffect, useRef } from 'react';
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
import { postImage, postProfileInfo, deleteImage } from '../data/dataApi';
import Lightbox from 'react-image-lightbox';
import ImageCard from '../components/ImageCard';
import ImageUploader from 'react-images-upload';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { blobToFile } from '../util/util';

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
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    aspect: 1,
    width: 30
  });
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('default');

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
          //clear state
          setInputImage(undefined);
          setCroppedImageUrl(undefined);
          setFileName('default');
          setSrc(undefined);
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
      await deleteImage(imageId, token);
      images.length < 2 ?
        setImages(oldImages => [] as Image[]) :
        setImages(oldImages => [...oldImages.slice(0, index), ...oldImages.slice(index + 1)]);
      setToastText('Image removed successfully');
      setShowToast(true);
    } catch (e) {
      console.log(`There was an issue deleting the image`);
    }
  }

  const handeChange = (files: File[]) => {
    const file = files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.addEventListener('load', () => setSrc(reader.result as string))
    reader.readAsDataURL(file);
  }

  const handleCropChange = (crop: Crop) => {
    setCrop(crop);
  }

  const onImageLoaded = (image: HTMLImageElement) => {
    setImage(image);
  };

  const onCropComplete = (crop: Crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = (crop: Crop) => {
    if (image && crop.width && crop.height) {
      getCroppedImg(
        image,
        crop,
        `${fileName}.png`
      );
    }
  }

  const getCroppedImg = (image: HTMLImageElement , crop: Crop, fileName: string) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width as number;
    canvas.height = crop.height as number;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x as number * scaleX,
        crop.y  as number* scaleY,
        crop.width as number * scaleX,
        crop.height as number * scaleY,
        0,
        0,
        crop.width as number,
        crop.height as number
      );
    }

    canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error('Canvas is empty');
          return '';
        }
        setInputImage(blobToFile(blob, fileName));
        window.URL.revokeObjectURL(croppedImageUrl as string);
        const fileUrl = window.URL.createObjectURL(blob);
        setCroppedImageUrl(fileUrl);
      }, 'image/png');
  }

  const setValues = () => {
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
                    <IonCol size="12" size-md="4">
                      <ImageCard
                        images={images}
                        areDeletable={isEditing}
                        onDelete={removeImage}
                      >
                        {
                          isEditing && (
                            <>
                              <IonCol size="12" size-md="6">
                                <IonCard>
                                  {
                                    !src &&
                                    <ImageUploader
                                      withIcon={true}
                                      buttonText="Choose Image"
                                      onChange={handeChange}
                                      imgExtension={['.jpg', '.jpeg', '.png']}
                                      maxFileSize={5242880}
                                      singleImage={true}
                                    />
                                  }
                                  {
                                    src &&
                                      <ReactCrop
                                        src={src}
                                        crop={crop}
                                        ruleOfThirds
                                        onImageLoaded={onImageLoaded}
                                        onComplete={onCropComplete}
                                        onChange={handleCropChange}
                                        keepSelection={true}
                                      />
                                  }
                                  {
                                    croppedImageUrl &&
                                    <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl}></img>
                                  }
                                  {
                                    inputImage && (
                                      <IonButton expand="block" onClick={uploadImage}>
                                        Upload
                                      </IonButton>
                                    )
                                  }
                                </IonCard>
                              </IonCol>
                            </>
                          )
                        }
                      </ImageCard>

                    </IonCol>

                    <IonCol size="12" size-md="6">
                      <form noValidate onSubmit={updateProfile}>
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
                                  <IonRange step={5} min={1} max={1000} pin value={distance} onIonChange={e => setDistance(e.detail.value as number)}>
                                    <IonLabel slot="start">1</IonLabel>
                                    <IonLabel slot="end">1000</IonLabel>
                                  </IonRange>
                                </IonItem>
                                <IonItemDivider>
                                  <IonLabel>
                                    About
                                </IonLabel>
                                </IonItemDivider>
                                <IonItem>
                                  <IonTextarea
                                    value={about}
                                    onIonChange={e => setAbout(e.detail.value!)}
                                    autoGrow
                                    spellCheck={true}
                                    rows={4}
                                  ></IonTextarea>
                                </IonItem>
                              </IonList>
                          }
                          {
                            isEditing &&
                            <>
                              <IonButton type="submit" expand="block">Update</IonButton>
                              <IonButton onClick={() => { setIsEditing(false); }} color="light" expand="block">Cancel</IonButton>
                            </>
                          }
                          {
                            !isEditing &&
                            <IonButton expand="block" onClick={() => setIsEditing(true)}>Edit</IonButton>
                          }
                        </IonCard>
                      </form>
                    </IonCol>


                  </IonRow>
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