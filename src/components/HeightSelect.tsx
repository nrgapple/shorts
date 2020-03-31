import { IonSelect, IonSelectOption } from "@ionic/react";
import React from 'react'
import { heights } from '../util/util';

interface SelectProps {
    onSelect: (height: number) => void,
    height: number
}

const HeightSelect: React.FC<SelectProps> = ({
    onSelect,
    height,
}) => {
  return (
      <IonSelect value={height} placeholder="Choose height" onIonChange={(e) => onSelect(e.detail.value)}>
          { heights.map(({text, value}, idx) => (
              <IonSelectOption key={idx} value={value}>{text}</IonSelectOption>
          )) }
      </IonSelect>
  );
}

export default HeightSelect;