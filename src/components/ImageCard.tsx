import { IonCard, IonSlides, IonSlide, IonButton } from "@ionic/react";
import React, { useEffect } from 'react'
import { Image } from "../models/Image";
import { useState, useRef, DOMElement } from "react";
import Lightbox from "react-image-lightbox";
//@ts-ignore
import {Swiper, Slide} from 'react-dynamic-swiper';
import 'react-dynamic-swiper/lib/styles.css';

interface ImageCardProps {
  images: Image[];
  areDeletable: boolean;
  onDelete?: (imageId: number | undefined) => Promise<void>;
}

const ImageCard: React.FC<ImageCardProps> = ({
  images,
  areDeletable,
  onDelete,
}) => {
  const [showImage, setShowImage] = useState(false);
  const [bigImage, setBigImage] = useState<string | undefined>(undefined);
  const slides = useRef<any>(null);

  const onClick = async () => {
    if (slides.current) {
      const swiper = slides.current.swiper()
      console.log(swiper.realIndex);
      if (onDelete)
        await onDelete(images[swiper.realIndex] ? images[swiper.realIndex].imageId : undefined);
    }
  }

  return (
    <>
      <IonCard className="home-card">
        <Swiper ref={slides} 
        nextButton={false}
        scrollBar 
        navigation={false}
        swiperOptions={
          {
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerGroup: 1,
            spaceBetween: 0,
            autoHeight: true,
            centeredSlides: true,
            pagination: false,
            effect: 'flip',
            navigation: false,
          }
        }
          style={{ width: '100%', height: '100%' }}>
          {
            images.length > 0 ?
            images.map((img, key) => (
              <Slide key={key}>
                <img key={img.imageId}
                  src={img.imageUrl}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  onClick={() => {
                    setShowImage(true); setBigImage(img.imageUrl);
                  }
                  }
                />
              </Slide>
            )) : (
              <Slide>
                <img 
                  src="https://via.placeholder.com/150?text=No+Image"
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                />
              </Slide>
            )
          }
        </Swiper>


      </IonCard>
      <IonCard>
        {
          areDeletable &&
            <IonButton expand="block" color="danger" onClick={  () => onClick()}>
                Delete
            </IonButton>
        }
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