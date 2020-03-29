import { IonCard, IonSlides, IonSlide, IonButton } from "@ionic/react";
import React, { useEffect, EventHandler } from 'react'
import { Image } from "../models/Image";
import { useState, useRef, DOMElement } from "react";
import Lightbox from "react-image-lightbox";
//@ts-ignore
import {Swiper, Slide} from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';
import {
  useWindowSize,
} from '@react-hook/window-size/throttled'

interface ImageCardProps {
  images: Image[];
  areDeletable: boolean;
  onDelete?: (imageId: number | undefined) => Promise<void>;
}

const ImageCard: React.FC<ImageCardProps> = ({
  images,
  areDeletable,
  onDelete,
  children,
}) => {
  const [showImage, setShowImage] = useState(false);
  const [bigImage, setBigImage] = useState<string | undefined>(undefined);
  const slides = useRef<any>(null);

  const onClick = async () => {
    if (slides.current) {
      const swiper = await slides.current.getSwiper();
      if (onDelete)
        await onDelete(images[swiper.realIndex] ? images[swiper.realIndex].imageId : undefined);
    }
  }

  return (
    <>
      <IonCard className="home-card">
          {
            images.length > 0 &&
            <IonSlides ref={slides} key={images.map((image) => image.imageId).join("_")} pager={true} options={{initialSlide: 0, speed: 400, effect: 'flip'}}>
              {
                images.map((image, idx) => (
                  <IonSlide key={idx}>
                    <img
                      src={image.imageUrl}
                      style={{ height: '100%', width: '100%'}}
                      onClick={() => {setBigImage(image.imageUrl); setShowImage(true)}}
                    />
                  </IonSlide>
                ))
              }
            </IonSlides>
          }
        {
          areDeletable &&
            <IonButton expand="block" color="danger" onClick={  () => onClick()}>
                Delete
            </IonButton>
        }
        {children}
      </IonCard>
      {
        showImage && (
          <Lightbox
            mainSrc={bigImage ? bigImage : ''}
            onCloseRequest={() => setShowImage(false)}
          />
        )
      }
    </>
  );
}

export default ImageCard;