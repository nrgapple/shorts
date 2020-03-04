import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonInput, IonText } from '@ionic/react';
import './Login.scss';
import { setIsLoggedIn, setUsername, setToken } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { RouteComponentProps } from 'react-router';
import { loadNearMe } from '../data/sessions/sessions.actions';
import { postUserLocation, postSignup } from '../data/dataApi';
import { GeoPoint } from '../models/GeoPoint';

interface OwnProps extends RouteComponentProps {}

interface DispatchProps {
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadNearMe: typeof loadNearMe;
}

interface StateProps {
  point?: GeoPoint;
}

interface LoginProps extends OwnProps,  DispatchProps, StateProps { }

const Login: React.FC<LoginProps> = ({
  setIsLoggedIn, 
  history, 
  setUsername: setUsernameAction, 
  setToken: setTokenAction,
  point,
}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if(!username) {
      setUsernameError(true);
    }
    if(!password) {
      setPasswordError(true);
    }

    if(username && password) {
      try {
        const data = await postSignup(
          username,
          password,
          dob,
          firstName,
          lastName,
          email
        );
        console.log(data);
        if (!data.token)
        {
          setTokenError(true);
          throw "No Token data!";
        }

        setIsLoggedIn(true);
        setTokenAction(data.token);
        setUsernameAction(username);
        if (point)
          await postUserLocation(point, data.token);
        history.push('/tabs/home', {direction: 'none'});
      } catch (e) {
        console.log(`Error signing up: ${e}`);
      }
    }
  };

  return (
    <IonPage id="signup-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Signup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <div className="login-logo">
          <img src="assets/icon/shorts-512.png" alt="Ionic logo" />
        </div>

        <form noValidate onSubmit={signup}>
          <IonList>
            <IonItem>
              <IonLabel position="stacked" color="primary">Username</IonLabel>
              <IonInput name="username" type="text" value={username} spellCheck={false} autocapitalize="off" onIonChange={e => {
                setUsername(e.detail.value!);
                setUsernameError(false);
              }}
                required>
              </IonInput>
            </IonItem>

            {formSubmitted && usernameError && <IonText color="danger">
              <p className="ion-padding-start">
                Username is required
              </p>
            </IonText>}

            <IonItem>
              <IonLabel position="stacked" color="primary">Password</IonLabel>
              <IonInput name="password" type="password" value={password} onIonChange={e => {
                setPassword(e.detail.value!);
                setPasswordError(false);
              }}>
              </IonInput>
            </IonItem>

            {formSubmitted && passwordError && <IonText color="danger">
              <p className="ion-padding-start">
                Password is required
              </p>
            </IonText>}

            <IonItem>
              <IonLabel position="stacked" color="primary">Date of Birth</IonLabel>
              <IonInput name="dob" type="date" value={dob} spellCheck={false} autocapitalize="off" onIonChange={e => {
                setDob(e.detail.value!);
              }}
                required>
              </IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked" color="primary">First Name</IonLabel>
              <IonInput name="firstName" type="text" value={firstName} spellCheck={false} autocapitalize="on" onIonChange={e => {
                setFirstName(e.detail.value!);
              }}
                required>
              </IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked" color="primary">Last Name</IonLabel>
              <IonInput name="lastName" type="text" value={lastName} spellCheck={false} autocapitalize="on" onIonChange={e => {
                setLastName(e.detail.value!);
              }}
                required>
              </IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked" color="primary">Email</IonLabel>
              <IonInput name="email" type="email" value={email} spellCheck={false} autocapitalize="off" onIonChange={e => {
                setEmail(e.detail.value!);
              }}
                required>
              </IonInput>
            </IonItem>

            {formSubmitted && tokenError && <IonText color="danger">
              <p className="ion-padding-start">
                Issue getting token.
              </p>
            </IonText>}
          </IonList>

          <IonRow>
            <IonCol>
              <IonButton type="submit" expand="block">Create</IonButton>
            </IonCol>
          </IonRow>
        </form>

      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    point: state.user.location,
  }),
  mapDispatchToProps: {
    setIsLoggedIn,
    setUsername,
    setToken,
    loadNearMe,
  },
  component: Login
})