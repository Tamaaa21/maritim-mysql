"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HeroBackgroundSlideshow from "./HeroBackgroundSlideshow";

export default function HeroSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const title = "STASIUN METEOROLOGI MARITIM";
  const highlight = "TEGAL";

  // Framer motion variants for professional staggered character entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.15,
      }
    }
  } as const;

  const letterVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring", damping: 14, stiffness: 100 }
    }
  } as const;

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background Slideshow (realistic BMKG building daylight image) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <HeroBackgroundSlideshow onImageChange={setSlideIndex} />
      </div>

      {/* Main Background Blue Gradient Overlay (around 40% - 50% opacity, rich blue, clear sky visible) */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#001a4d]/65 via-[#002b80]/45 to-[#001122]/60 z-10 pointer-events-none"
      />

      {/* Subtle Blue Gradient from the bottom to blend sections */}
      <div 
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#002b80]/50 via-[#002b80]/15 to-transparent z-10 pointer-events-none"
      />

      {/* Main Content Wrapper */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center">
        
        {/* Animated Single-Line Typography Container */}
        <div className="relative w-full py-8 px-6 flex justify-center items-center">
          <motion.h1
            key={slideIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            suppressHydrationWarning
            className="relative z-10 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-wider uppercase text-center select-none max-w-7xl px-4"
          >
            {/* Main Title Words */}
            {title.split(" ").map((word, idx) => (
              <span 
                key={idx} 
                className="inline-block whitespace-nowrap text-white" 
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}
              >
                {word.split("").map((char, cIdx) => (
                  <motion.span key={cIdx} variants={letterVariants} suppressHydrationWarning className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
            
            {/* Highlighted Yellow "TEGAL" */}
            <span 
              className="inline-block whitespace-nowrap text-[#FFD700]" 
              style={{ textShadow: '0 4px 16px rgba(255, 215, 0, 0.25), 0 2px 4px rgba(0,0,0,0.6)' }}
            >
              {highlight.split("").map((char, cIdx) => (
                <motion.span key={cIdx} variants={letterVariants} suppressHydrationWarning className="inline-block">
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </div>

      </div>
    </section>
  );
}
