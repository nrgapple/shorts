import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButton, useIonViewDidEnter, useIonViewDidLeave, IonText, IonList } from '@ionic/react';
import { connect } from '../data/connect';
import pwaInstallHandler from 'pwa-install-handler';
import { RouteComponentProps } from 'react-router';

interface OwnProps {}

interface DispatchProps {
}

interface DownloadProps extends OwnProps,  DispatchProps, RouteComponentProps { }

const Download: React.FC<DownloadProps> = ({
    history
}) => {

    const [isInstallable, setIsInstallable] = useState<boolean | undefined>(undefined);

    useIonViewDidEnter(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            history.push('/tabs/home', { direction: 'forward'})
        }
        pwaInstallHandler.addListener(canIstallListen);
    })

    useIonViewDidLeave(() => {
        pwaInstallHandler.removeListener(canIstallListen);
    })

    const install = () => {
        pwaInstallHandler.install().then((installed: boolean) => {
            history.push('/tabs/home', { direction: 'forward'})
        });
    }

    const canIstallListen = (canInstall: boolean) => {
        setIsInstallable(canInstall);
    }

  return (
    <IonPage id="login-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Download</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {
            isInstallable
            ? 
                <IonButton expand='full' onClick={install}>Install</IonButton>
            : 
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <h1>Steps to Install</h1>
                        <div>
                            <h5 style={{ marginLeft: '20px'}}>Mobile</h5>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: '100px'
                            }}>
                                <p>Press the options button at the bottom of safari</p>
                                <img src='/assets/icon/safari-option.png'></img>
                                <p>Click Add to Home Screen</p>
                                <img src='/assets/icon/add.png'></img>
                            </div>
                            <h5 style={{ marginLeft: '20px'}}>Desktop</h5>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>                                
                                <p>
                                    Click the + button on the right side of the address bar
                                </p>
                                <img src='/assets/icon/plus.png'></img>
                            </div>
                        </div>
                    </div>
        }
      </IonContent>

    </IonPage>
  );
};

export default connect<OwnProps, {}, DispatchProps>({
  mapDispatchToProps: {
  },
  component: Download,
})