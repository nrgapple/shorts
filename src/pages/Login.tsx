import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonIcon } from '@ionic/react';
import './Login.scss';
import { setIsLoggedIn, setUsername, setToken } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { RouteComponentProps, useLocation } from 'react-router';
import { loadAllInfo } from '../data/sessions/sessions.actions';
import { postLogin, postLoginFB } from '../data/dataApi';
import { vars } from '../data/env';
import { logoFacebook } from 'ionicons/icons';
import queryString from 'query-string';

interface OwnProps extends RouteComponentProps { }

interface DispatchProps {
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
  loadAllInfo: typeof loadAllInfo;
}

interface LoginProps extends OwnProps, DispatchProps { }

const Login: React.FC<LoginProps> = ({
  setIsLoggedIn,
  history,
  setUsername: setUsernameAction,
  setToken: setTokenAction,
}) => {



  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [, setTokenError] = useState(false);
  const location = useLocation();


  const loginOG = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!username) {
      setUsernameError(true);
    }
    if (!password) {
      setPasswordError(true);
    }

    if (username && password) {
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
        history.push('/tabs/home', { direction: 'none' });
      } catch (e) {
        if (e.message === "Invalid Credentials") {
          setValidationError(true);
        }
        console.log(`Error logging in. ${e}`);
      }
    }
  };

  const loginFB = async () => {
    try {
      await postLoginFB();
    } catch {
      setValidationError(true);
      console.log(`Error logging in with facebook`);
    }
  }

  useEffect(() => {
    if (location) {
      console.log(queryString.parse(location.search));
      if (queryString.parse(location.search).token) {
        setTokenAction(queryString.parse(location.search).token as string);
        history.push('/tabs/home', { direction: 'none' });
      }
    }
  }, [location]);

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

        <form noValidate onSubmit={loginOG}>
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
              <IonButton type="submit" expand="full">Login</IonButton>
            </IonCol>
            <IonCol>
              <IonButton onClick={loginFB} color="facebook" expand="full">
                Login with Facebook  <IonIcon icon={logoFacebook}></IonIcon>
            </IonButton>
            </IonCol>
            <IonCol>
              <IonButton routerLink="/signup" color="light" expand="full">Signup</IonButton>
            </IonCol>
          </IonRow>
          <IonRow></IonRow>
        </form>

        <form noValidate onSubmit={loginFB}>

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