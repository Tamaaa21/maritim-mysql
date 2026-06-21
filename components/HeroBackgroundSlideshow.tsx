"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isVideoUrl } from "@/lib/utils";
import { getYoutubeVideoId, isYoutubeUrl } from "@/lib/youtube";

const defaultImages: string[] = [];

export default function HeroBackgroundSlideshow({ onImageChange }: { onImageChange?: (index: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<string[]>(defaultImages);

  useEffect(() => {
    let mounted = true;
    async function fetchHero() {
      try {
        const res = await fetch("/api/admin/hero-images");
        const json = await res.json();
        if (mounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const urls = json.data.map((it: any) => it.url).filter(Boolean);
          if (urls.length) setImages(urls);
        }
      } catch (e) {
        console.error("Gagal memuat hero images:", e);
      }
    }
    fetchHero();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 8000); // 8 seconds slideshow speed
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    // ensure current index stays within bounds when images change
    if (current >= images.length) setCurrent(0);
  }, [images, current]);

  useEffect(() => {
    if (onImageChange) {
      onImageChange(current);
    }
  }, [current, onImageChange]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          suppressHydrationWarning
          className="absolute inset-0 w-full h-full"
        >
          {isYoutubeUrl(images[current]) ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(images[current])}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeVideoId(images[current])}&rel=0&showinfo=0`}
              className="w-full h-full object-cover pointer-events-none"
              allow="autoplay; encrypted-media"
              frameBorder="0"
              allowFullScreen
            />
          ) : isVideoUrl(images[current]) ? (
            <video
              src={images[current]}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={images[current]}
              alt="Hero background"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          {/* Left Navigation Arrow */}
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 transition-all duration-200 active:scale-95 shadow-lg border border-white/5"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Navigation Arrow */}
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 transition-all duration-200 active:scale-95 shadow-lg border border-white/5"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? "bg-white w-6 shadow-md" : "bg-white/40 hover:bg-white/60 w-1.5"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
