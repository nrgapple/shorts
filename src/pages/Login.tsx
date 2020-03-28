import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonInput, IonText } from '@ionic/react';
import './Login.scss';
import { setIsLoggedIn, setUsername, setToken } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { RouteComponentProps } from 'react-router';
import axios from 'axios';
import { loadNearMe, loadProfile, loadMatches, loadAllInfo } from '../data/sessions/sessions.actions';
import { postLogin, postDevice } from '../data/dataApi';

interface OwnProps extends RouteComponentProps {}

interface DispatchProps {
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadAllInfo: typeof loadAllInfo;
}

interface LoginProps extends OwnProps,  DispatchProps { }

const Login: React.FC<LoginProps> = ({
  setIsLoggedIn, 
  history, 
  setUsername: setUsernameAction, 
  setToken: setTokenAction,
  loadAllInfo: loadAllInfoAction,
}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const apiURL = 'https://doctornelson.herokuapp.com';

  const login = async (e: React.FormEvent) => {
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
        const data = await postLogin(
          username,
          password, 
        );
        if (!data.token) {
          setTokenError(true);
          return
        }
        setIsLoggedIn(true);
        setTokenAction(data.token);
        setUsernameAction(username);
        const key = localStorage.getItem("push_key");
        const auth = localStorage.getItem("push_auth");
        const endpoint = localStorage.getItem("push_endpoint");
        if (key && auth && endpoint) {
          await postDevice(key, auth, endpoint, data.token);
          localStorage.removeItem("push_key");
          localStorage.removeItem("push_auth");
          localStorage.removeItem("push_endpoint");
        }
        history.push('/tabs/home', {direction: 'none'});
      } catch (e) {
        if (e.message === "Invalid Credentials") {
          setValidationError(true);
        }
        console.log(`Error logging in. ${e}`);
      }
    }
  };

  return (
    <IonPage id="login-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <div className="login-logo">
          <img src="assets/icon/shorts-512.png" alt="Ionic logo" />
        </div>

        <form noValidate onSubmit={login}>
          <IonList>
            <IonItem>
              {formSubmitted && validationError && <IonText color="danger">
                <p className="ion-padding-start">
                  Username or Password incorrect
                </p>
              </IonText>}

              <IonLabel position="stacked" color="primary">Username</IonLabel>
              <IonInput name="username" type="text" value={username} spellCheck={false} autocapitalize="off" onIonChange={e => setUsername(e.detail.value!)}
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
              <IonInput name="password" type="password" value={password} onIonChange={e => setPassword(e.detail.value!)}>
              </IonInput>
            </IonItem>
            <IonItem routerLink="/forgot"><IonText>Forgot password</IonText></IonItem>

            {formSubmitted && passwordError && <IonText color="danger">
              <p className="ion-padding-start">
                Password is required
              </p>
            </IonText>}
          </IonList>

          <IonRow>
            <IonCol>
              <IonButton type="submit" expand="block">Login</IonButton>
            </IonCol>
            <IonCol>
              <IonButton routerLink="/signup" color="light" expand="block">Signup</IonButton>
            </IonCol>
          </IonRow>
        </form>

      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, {}, DispatchProps>({
  mapDispatchToProps: {
    setIsLoggedIn,
    setUsername,
    setToken,
    loadAllInfo,
  },
  component: Login
})