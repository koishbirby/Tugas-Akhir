// src/pages/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import BackgroundPattern from '../components/splash/BackgroundPattern';
import FloatingElements from '../components/splash/FloatingElements';
import LogoContainer from '../components/splash/LogoContainer';
import TitleSection from '../components/splash/TitleSection';
import Footer from '../components/splash/Footer';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            setFadeOut(true);

            setTimeout(() => {
              setIsVisible(false);

              setTimeout(() => {
                if (typeof onComplete === 'function') onComplete();
              }, 100);
            }, 600);
          }, 800);

          return 100;
        }
        const next = prev + 4;
        return next > 100 ? 100 : next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!isVisible) return null;

  // Percentage used to calculate the background fade
  const nightOpacity = progress / 100;        // 0 → 1
  const dayOpacity = 1 - nightOpacity;        // 1 → 0

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-600 ease-out px-4 sm:px-6
        ${!fadeIn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        ${fadeOut ? 'opacity-0 scale-105' : ''}
      `}
    >

      {/* DAY / MORNING GRADIENT */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          opacity: dayOpacity,
          background: "linear-gradient(to bottom right, #FDBA74, #FEF3C7, #FFEDD5)" // orange → soft yellow
        }}
      />

      {/* NIGHT GRADIENT */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          opacity: nightOpacity,
          background: "linear-gradient(to bottom right, #1E3A8A, #1E40AF, #312E81)" // navy → deep blue
        }}
      />

      <BackgroundPattern fadeOut={fadeOut} />
      <FloatingElements fadeOut={fadeOut} />

      <div
        className={`relative z-10 flex flex-col items-center justify-center max-w-xs sm:max-w-lg w-full transition-all duration-800
          ${!fadeIn ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}
          ${fadeOut ? 'opacity-0 -translate-y-8' : ''}
        `}
      >
        <LogoContainer />
        <TitleSection fadeIn={fadeIn} />

        {/* LOADING BAR REMOVED */}
      </div>

      <Footer fadeOut={fadeOut} fadeIn={fadeIn} />
    </div>
  );
}
