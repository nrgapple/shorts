import { IonCard, IonCardContent, IonChip, IonIcon, IonLabel, IonCardHeader, IonCardTitle } from "@ionic/react";
import React from 'react'
import 'react-dynamic-swiper/lib/styles.css';
import { Profile } from "../models/Profile";
import { calendar, body, pin, paperPlane } from "ionicons/icons";
import { calculateAge, findHeightString } from "../util/util";
import '../pages/Home.scss';

interface InfoCardProps {
  profile: Profile;
}

const InfoCard: React.FC<InfoCardProps> = ({
  profile,
}) => {
  return (
    <>
      <IonCard className="home-card">
        <IonCardHeader translucent>
          <IonCardTitle>
            {profile.firstName}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="outer-content">
          <IonChip color="secondary" outline>
            <IonIcon icon={calendar} />
            <IonLabel>
              {calculateAge(profile.dob)}
            </IonLabel>
          </IonChip>
          <IonChip color="secondary" outline>
            <IonIcon icon={body} />
            <IonLabel>
            {findHeightString(profile.height!)}
            </IonLabel>
          </IonChip>
          <IonChip color="secondary" outline>
            <IonIcon icon={pin} />
            <IonLabel>
              {profile.displayAddress}
            </IonLabel>
          </IonChip>
          <IonChip color="secondary" outline>
            <IonIcon icon={paperPlane} />
            <IonLabel>
              {profile.distance! <= 0 ? '< 1 mile' : `${profile.distance} ${profile.distance! === 1 ? 'mile' : 'miles'}`}
            </IonLabel>
          </IonChip>
        </IonCardContent>
        <IonCardContent>
          <p className="ion-padding-start ion-padding-end">
            { profile.about? profile.about : ''}
          </p>
        </IonCardContent>
      </IonCard>
    </>
  );
}

export default InfoCard;