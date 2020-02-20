import React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';

interface EditPopoverProps {
  edit: () => void;
};

const EditPopover: React.FC<EditPopoverProps> = ({edit}) => {

  return (
    <IonList>
      <IonItem button onClick={edit}>
        <IonLabel>Edit</IonLabel>
      </IonItem>
    </IonList >
  )
}

export default EditPopover;