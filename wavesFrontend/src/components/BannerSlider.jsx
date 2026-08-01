import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import HeroPromoSlider from '../components/HeroPromoSlider';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const BannerSlider = () => {
    const { t, dir } = useLanguage();
    const isRtl = dir === 'rtl';

    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        API.get('/banners')
            .then((res) => setSlides(Array.isArray(res.data?.data) ? res.data.data : []))
            .catch(() => setSlides([]));
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [slides.length]);

    if (!slides.length) {
        return (
            <div className="w-full">
                <HeroPromoSlider />
            </div>
        );
    }

    const slide = slides[currentIndex] || slides[0];

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30 font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="relative w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]"
                >
                    {/* Background image: object-cover keeps every banner's own image proportional
                        and uncropped-looking regardless of the dimensions the admin uploaded. */}
                    {(slide.image || slide.image_url) && (
                        <img
                            src={slide.image || slide.image_url}
                            alt={slide.title || 'Promotion'}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                    )}

                    {/* Direction-aware overlay: the readable text sits over the darker side,
                        which flips automatically between LTR and RTL. */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-r ${isRtl
                                ? 'from-black/10 via-black/45 to-black/85'
                                : 'from-black/85 via-black/45 to-black/10'
                            }`}
                    />

                    <div
                        className={`relative z-10 flex min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] w-full items-center p-6 sm:p-10 lg:p-14 ${isRtl ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`flex w-full max-w-full flex-col gap-3 sm:max-w-md sm:gap-4 lg:max-w-lg text-white ${isRtl ? 'items-end text-right' : 'items-start text-left'
                                }`}
                        >
                            {slide.tag && (
                                <motion.span
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md sm:text-xs"
                                >
                                    <Tag className="h-3 w-3 shrink-0 text-[#AACDDC]" />
                                    <span className="truncate">{slide.tag}</span>
                                </motion.span>
                            )}

                            <motion.h3
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="break-words text-xl font-black uppercase leading-tight tracking-tight sm:text-3xl lg:text-4xl"
                            >
                                {slide.title}
                            </motion.h3>

                            {slide.description && (
                                <motion.div
                                    initial={{ y: 15, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="max-w-full"
                                >
                                    <span className="break-words bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-xs font-black uppercase tracking-widest text-transparent sm:text-sm">
                                        {slide.description}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {slides.length > 1 && (
                <div className={`absolute bottom-5 z-20 flex gap-1.5 ${isRtl ? 'right-6' : 'left-6'}`}>
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={t('common.goToSlide', { number: idx + 1 })}
                        />
                    ))}
                </div>
            )}

            {slides.length > 1 && (
                <div className={`absolute bottom-5 z-20 flex items-center gap-2 ${isRtl ? 'left-6' : 'right-6'}`}>
                    <button
                        onClick={handlePrev}
                        className="rounded-full border border-white/20 bg-black/40 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-black/70 active:scale-95 sm:p-2.5"
                        aria-label={t('common.previousSlide')}
                    >
                        {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={handleNext}
                        className="rounded-full border border-white/20 bg-black/40 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-black/70 active:scale-95 sm:p-2.5"
                        aria-label={t('common.nextSlide')}
                    >
                        {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default BannerSlider;
