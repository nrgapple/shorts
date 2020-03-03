import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButtons, IonMenuButton, IonRow, IonCol, IonButton, IonList, IonItem, IonLabel, IonInput, IonText } from '@ionic/react';
import './Login.scss';
import { connect } from '../data/connect';
import axios from 'axios';
import { postForgot } from '../data/dataApi';

interface OwnProps {}

interface DispatchProps {
}

interface ForgotProps extends OwnProps,  DispatchProps { }

const Forgot: React.FC<ForgotProps> = ({
}) => {

  const [email, setEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    if(email) {
      try {
        await postForgot(email);
        setSuccess(true);
      } catch (e) {
        setValidationError(`Something went wrong... try again.`);
        console.log(`Error sending email ${e}`);
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
          <IonTitle>Forgot Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form noValidate onSubmit={sendRequest}>
          <IonList>
            <IonItem>
              {
                formSubmitted && validationError && 
                <IonText color="danger">
                  <p className="ion-padding-start">
                    {validationError}
                  </p>
                </IonText>
              }
              {
                formSubmitted && success ?
                <IonText>
                  <p className="ion-padding-start">
                    Check your email for password reset.
                  </p>
                </IonText>
                :
                <>
                <IonLabel position="stacked" color="primary">Enter your email to reset your password</IonLabel>
                <IonInput name="username" type="text" value={email} spellCheck={false} autocapitalize="off" onIonChange={e => setEmail(e.detail.value!)}
                  required>
                </IonInput>
                </>
              }
            </IonItem>
          </IonList>
          {
            !success &&
            <IonRow>
              <IonCol>
                <IonButton type="submit" expand="block">Send</IonButton>
              </IonCol>
            </IonRow>
          }
        </form>

      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, {}, DispatchProps>({
  mapDispatchToProps: {
  },
  component: Forgot,
})