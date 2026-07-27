import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import HeroPromoSlider from '../components/HeroPromoSlider';
import API from '../api/axios';

// The small promo slider next to the hero section - fully admin-managed via GET /api/banners
// (Admin > Banners in the dashboard: title, tag, description, image, link, status).
// Separate from the big hero section above it (GET /api/hero, see Home.jsx) - "banners" here
// means a list of promo slides, not the whole top section.
const BannerSlider = () => {
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
        }, 4000);
        return () => clearInterval(timer);
    }, [slides]);

    // No real banners yet (admin hasn't added any) - show the decorative placeholder instead
    // of an empty box
    if (!slides.length) {
        return (
            <div className="w-full">
                <HeroPromoSlider />
            </div>
        );
    }

    const slide = slides[currentIndex];

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-white/30 backdrop-blur-xl font-sans">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-gray-900/80 to-black/90 backdrop-blur-md flex flex-row items-center justify-between p-6 sm:p-8 text-white overflow-hidden"
                >
                    {/* Left Content Side - tag/title/description all come from the admin-edited banner */}
                    <div className="z-10 w-1/2 pr-4 space-y-3">
                        {slide.tag && (
                            <motion.span
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase bg-white/15 rounded-full backdrop-blur-md border border-white/20"
                            >
                                <Tag className="w-3 h-3 text-[#AACDDC]" />
                                {slide.tag}
                            </motion.span>
                        )}

                        <motion.h3
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase leading-tight"
                        >
                            {slide.title}
                        </motion.h3>

                        {slide.description && (
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="text-xs sm:text-sm font-black tracking-widest uppercase bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                                    {slide.description}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Image Side with Frosted Frame */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="relative w-1/2 h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                    >
                        <img
                            src={slide.image || slide.image_url}
                            alt={slide.title || 'Promotion'}
                            className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-700"
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-5 left-6 z-20 flex gap-1.5">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Controls */}
            {slides.length > 1 && (
                <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        className="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition border border-white/20 shadow-sm active:scale-95"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition border border-white/20 shadow-sm active:scale-95"
                        aria-label="Next Slide"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BannerSlider;
