import { IonCard, IonSlides, IonSlide, IonButton, useIonViewDidEnter, useIonViewWillEnter } from "@ionic/react";
import React, { Fragment } from 'react'
import { Image } from "../models/Image";
import { useState, useRef, DOMElement } from "react";
import Lightbox from "react-image-lightbox";
//@ts-ignore

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
  const slides = useRef<any>(null);
  const [showImage, setShowImage] = useState<boolean>(false);
  const [bigImage, setBigImage] = useState<string>();

  useIonViewWillEnter(() => {
    if (slides.current) {
      slides.current.update();
    }
  })

  const onClick = async () => {
    if (slides.current) {
      const swiper = await slides.current.getSwiper();
      if (onDelete)
        await onDelete(images[swiper.realIndex] ? images[swiper.realIndex].imageId : undefined);
        slides.current.update();
    }
  }

  return (
    <Fragment>
          {
            images.length > 0 &&
            <IonSlides style={{height: '300px', width: '300px'}} ref={slides} key={images.map((image) => image.imageId).join("_")} pager={true} options={{initialSlide: 0, speed: 400, effect: 'fade'}}>
              {
                images.map((image, idx) => (
                  <IonSlide key={idx} style={{ position: 'relative'}}>
                    <img
                      src={image.imageUrl}
                      style={{ height: '100%', width: '100%', borderRadius: '5px'}}
                      onClick={() => { 
                        setBigImage(image.imageUrl); 
                        setShowImage(true); 
                      }}
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
        {
          showImage &&
            <Lightbox
              mainSrc={bigImage as string}
              onCloseRequest={() => setShowImage(false)}
            />
        }
    </Fragment>
  );
}

export default ImageCard;