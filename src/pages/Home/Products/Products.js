                <Swiper
                    spaceBetween={10}
                    slidesPerView={3}
                    breakpoints={{
                        1280: { slidesPerView: 3 },
                        1024: { slidesPerView: 2 },
                        768: { slidesPerView: 2 },
                        0: { slidesPerView: 1 },
                    }}
                    loop={products.length > 3}
                    modules={[Autoplay]}
                    autoplay={products.length > 1 ? {
                        delay: 2000,
                        disableOnInteraction: false,
                    } : false}
                > 