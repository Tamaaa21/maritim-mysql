"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultImages = [
  "/bg.jpeg"];
const isVideoUrl = (url: string) => {
  return !!(url && (url.match(/\.(mp4|webm|ogg|mov|mkv|avi|3gp|flv|wmv)/i) || url.includes("video")));
};

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
        // keep defaults on error
      }
    }
    fetchHero();
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
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

  return (
    <>
      {/* Mobile: use a single, static background (first image/video) to save bandwidth and improve layout */}
      {isVideoUrl(images[0]) ? (
        <div className="absolute inset-0 w-full h-full md:hidden bg-black overflow-hidden" aria-hidden>
          <video
            src={images[0]}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url(${images[0]})`, backgroundRepeat: 'no-repeat' }}
          aria-hidden
        />
      )}

      {/* Desktop and up: animated slideshow */}
      <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden">
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
            {isVideoUrl(images[current]) ? (
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
      </div>
    </>
  );
}
