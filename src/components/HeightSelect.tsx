import { IonSelect, IonSelectOption } from "@ionic/react";
import React from 'react'

const heights = [
    {text: "4'0", value: 48},
    {text: "4'1", value: 49},
    {text: "4'2", value: 50},
    {text: "4'3", value: 51},
    {text: "4'4", value: 52},
    {text: "4'5", value: 53},
    {text: "4'6", value: 54},
    {text: "4'7", value: 55},
    {text: "4'8", value: 56},
    {text: "4'9", value: 57},
    {text: "4'10", value: 58},
    {text: "4'11", value: 59},
    {text: "5'0", value: 60},
    {text: "5'0", value: 61},
    {text: "5'1", value: 62},
    {text: "5'2", value: 63},
    {text: "5'3", value: 64},
    {text: "5'4", value: 65},
    {text: "5'5", value: 66},
    {text: "5'6", value: 67},
    {text: "5'7", value: 68},
    {text: "5'8", value: 69},
    {text: "5'9", value: 70},
    {text: "5'10", value: 71},
    {text: "5'11", value: 72},
    {text: "6'0", value: 73},
    {text: "6'1", value: 74},
    {text: "6'2", value: 75},
    {text: "6'3", value: 76},
    {text: "6'4", value: 77},
    {text: "6'5", value: 78},
    {text: "6'6", value: 79},
    {text: "6'7", value: 80},
    {text: "6'8", value: 81},
    {text: "6'9", value: 82},
]

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