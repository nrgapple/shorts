import React, { useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonInput, IonText, IonProgressBar } from '@ionic/react';
import './Login.scss';
import { setIsLoggedIn, setUsername, setToken } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { RouteComponentProps, useHistory, useLocation } from 'react-router';
import { postReset, getVerify } from '../data/dataApi';
import queryString from 'query-string';

interface OwnProps extends RouteComponentProps { }

interface DispatchProps {
  setIsLoggedIn: typeof setIsLoggedIn;
  setUsername: typeof setUsername;
  setToken: typeof setToken;
}

interface ResetProps extends OwnProps, DispatchProps { }

const Reset: React.FC<ResetProps> = ({
  setIsLoggedIn,
  setToken: setTokenAction,
}) => {

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [, setTokenError] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [forgotPwToken, setForgotPwToken] = useState<string | undefined>(undefined);
  const [validToken, setValidToken] = useState<boolean | undefined>(undefined);
  const [pwMatch, setPwMatch] = useState<undefined | boolean>(undefined);

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (forgotPwToken && password1 && password2) {
      try {
        const data = await postReset(
          forgotPwToken,
          password2,
        );
        if (!data.token) {
          setTokenError(true);
          return
        }
        setIsLoggedIn(true);
        setTokenAction(data.token);
        history.push('/tabs/home', { direction: 'none' });
      } catch (e) {
        setValidationError(`Something went wrong.`);
        console.log(`Error logging in. ${e}`);
      }
    }
  };

  const validateForgotToken = async (token: string) => {
    try {
      const data = await getVerify(token);
      if (data.status === 200) {
        setValidToken(true);
      }
    } catch (e) {
      setValidToken(false);
      console.log(`Error validating token: ${JSON.stringify(e)}`);
    }
  }

  const checkPwMatch = async (pw1: string, pw2: string) => {
    if (pw1 === pw2) {
      setPwMatch(true);
    } else {
      setPwMatch(false);
    }
  }

  // get token from query.
  useEffect(() => {
    if (location) {
      console.log(queryString.parse(location.search));
      setForgotPwToken(queryString.parse(location.search).token as string);
    }
  }, [location]);

  // validate token.
  useEffect(() => {
    if (forgotPwToken) {
      validateForgotToken(forgotPwToken);
    }
  }, [forgotPwToken])

  useEffect(() => {
    if (password2 != "") {
      console.log(pwMatch);
      checkPwMatch(password1, password2);
    }
  }, [password2, password1])

  return (
    <IonPage id="login-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Reset</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>

        <div className="login-logo">
          <img src="assets/img/appicon.svg" alt="Ionic logo" />
        </div>
        {
          validToken === undefined ? (
            <IonProgressBar type="indeterminate"></IonProgressBar>
          )
            : (
              !validToken ?
                <IonItem>
                  <IonText>Invalid reset token.</IonText>
                </IonItem>
                :
                <form noValidate onSubmit={reset}>
                  <IonList>
                    {formSubmitted && validationError && <IonText color="danger">
                      <p className="ion-padding-start">
                        {validationError}
                      </p>
                    </IonText>}

                    <IonItem>
                      <IonLabel position="stacked" color="primary">New Password</IonLabel>
                      <IonInput name="password" type="password" value={password1} onIonChange={e => setPassword1(e.detail.value!)}>
                      </IonInput>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked" color={pwMatch === false ? "danger" : "primary"}>
                        {
                          pwMatch === undefined ? "Reenter Password" :
                            pwMatch ? "Match!" :
                              "Passwords don't match"
                        }
                      </IonLabel>
                      <IonInput name="password" type="password" value={password2} onIonChange={e => { setPassword2(e.detail.value!) }}>
                      </IonInput>
                    </IonItem>
                  </IonList>

                  <IonRow>
                    <IonCol>
                      <IonButton type="submit" expand="block" disabled={!pwMatch}>Reset</IonButton>
                    </IonCol>
                  </IonRow>
                </form>
            )
        }

      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, {}, DispatchProps>({
  mapDispatchToProps: {
    setIsLoggedIn,
    setUsername,
    setToken,
  },
  component: Reset
})