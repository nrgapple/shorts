import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonItem, IonAvatar, IonSkeletonText, IonIcon, IonLabel } from '@ionic/react';
import { Profile } from '../models/Profile';
import { contact } from 'ionicons/icons';

interface MatchItemProps {
  profile?: Profile;
  onAction: (profile: Profile) => void;
}

const MatchItem: React.FC<MatchItemProps> = ({ profile, onAction }) => {
  
  return (
    <>
    {
      profile? (
      <>
        <IonItem button detail={false} onClick={() => onAction(profile)} lines="none">
          {profile.images.length > 0? (
            <IonAvatar slot="start">
              <img src={profile.images[0].imageUrl} alt="Pic" />
            </IonAvatar>
          ):(
            <IonAvatar slot="start">
              <img src={"https://via.placeholder.com/150?text=No+Image"} alt="Pic" />
            </IonAvatar>
          )}
          <IonLabel>{profile.firstName}</IonLabel> 
        </IonItem>
      </>
      ) : (
        <IonItem button detail={false} lines="none">
          <IonAvatar slot="start">
            <IonSkeletonText animated style={{width: '30%'}}/>
          </IonAvatar>
          <IonSkeletonText animated style={{width: '70%'}}/>
        </IonItem>
      )
    }
    
    </>
  );
};

export default MatchItem;