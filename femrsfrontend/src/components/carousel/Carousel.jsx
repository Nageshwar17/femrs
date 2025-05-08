// components/Carousel.js
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import styles from "./carousel.module.css";
import image from "../../assets/femrslogo.png"
import banner2 from "../../assets/banner2.jpg";
import banner1 from "../../assets/banner1.jpg";
import banner3 from "../../assets/banner3.png";
import bannerlogo from "../../assets/banners.png";

const images = [
  bannerlogo,
  banner1,
  banner2,
  banner3,
];

export default function Carousel() {
  return (
    <div className={styles.carouselcontainer}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <img src={img} alt={`slide-${index}`} className={styles.carouselimage} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
