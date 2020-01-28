import React from 'react';
import { IonCard, IonCardHeader, IonItem, IonAvatar, IonSkeletonText, IonIcon } from '@ionic/react';
import { Profile } from '../models/Profile';
import { contact } from 'ionicons/icons';

interface MatchItemProps {
  profile?: Profile;
}

const MatchItem: React.FC<MatchItemProps> = ({ profile }) => {
  return (
    <>
    {
      profile? (
      <>
        <IonCard className="speaker-card">
          <IonCardHeader>
            <IonItem button detail={false} routerLink={`/chats/`} lines="none">
                {profile.images.length > 0? (
                  <IonAvatar slot="start">
                    <img src={profile.images[0].imageUrl} alt="Pic" />
                  </IonAvatar>
                ):(
                  <IonIcon icon={contact}></IonIcon>
                )}
              {profile.firstName}
            </IonItem>
          </IonCardHeader>
        </IonCard>
      </>
      ) : (
        <IonCard className="speaker-card">
          <IonCardHeader>
            <IonItem button detail={false} routerLink={`/chats/[chatid]`} lines="none">
              <IonAvatar slot="start">
                <IonSkeletonText animated style={{width: '30%'}}/>
              </IonAvatar>
              <IonSkeletonText animated style={{width: '70%'}}/>
            </IonItem>
          </IonCardHeader>
        </IonCard>
      )
    }
    </>
  );
};

export default MatchItem;