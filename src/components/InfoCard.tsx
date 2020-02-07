import { IonCard, IonCardContent, IonChip, IonIcon, IonLabel, IonCardHeader, IonCardTitle } from "@ionic/react";
import React from 'react'
import 'react-dynamic-swiper/lib/styles.css';
import { Profile } from "../models/Profile";
import { calendar, body } from "ionicons/icons";
import { calculateAge } from "../util/util";
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
          <IonChip color="primary" outline>
            <IonIcon icon={calendar} />
            <IonLabel>
              {calculateAge(profile.dob)}
            </IonLabel>
          </IonChip>
          <IonChip color="secondary" outline>
            <IonIcon icon={body} />
            <IonLabel>
            {profile.height}
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