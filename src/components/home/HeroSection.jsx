// src/components/home/HeroSection.jsx
import { useState, useEffect } from "react";
import { ChefHat, Play, ArrowRight } from 'lucide-react';


export default function HeroSection() {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const currentYear = now.getFullYear();

      // Halloween date for this year
      const halloween = new Date(`${currentYear}-10-31T00:00:00`);

      // If Halloween has passed, count down to next year's Halloween
      if (now > halloween) {
        halloween.setFullYear(currentYear + 1);
      }

      const diff = halloween - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen md:min-h-[85vh] flex items-center bg-black -mt-20"> 
      {/* FULL BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/214334/pexels-photo-214334.jpeg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        
        {/* FADE GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/3 via-black/10 to-black"></div>
      </div>
        
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-12 w-32 h-32 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-8 w-24 h-24 bg-gradient-to-r from-cyan-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute bottom-1/4 left-16 w-20 h-20 bg-gradient-to-r from-indigo-200/25 to-blue-200/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-300/15 to-purple-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="md:hidden relative z-10 w-full px-4 py-8 text-center">
        <div className="mb-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 transform -skew-y-1 rounded-lg opacity-80"></div>
            <h1 className="relative text-2xl font-bold text-slate-800 px-4 py-2">
              The Season of Halloween is Upon Us All!
            </h1>
          </div>
          <h1 className="text-xl font-semibold text-orange-400 drop-shadow mb-6">🎃 Halloween Countdown: {countdown}</h1>
        </div>

        <div className="mb-8 max-w-xs mx-auto">
          <div className="space-y-3">
            {/* Top Image - Mobile Grid */}
            <div className="relative group">
              <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                <div className="w-full h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Featured Recipe"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Images - Mobile Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-500 hover:scale-105">
                  <div className="w-full h-20 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=150&fit=crop&crop=center"
                      alt="Featured Recipe 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                  <div className="w-full h-20 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=150&fit=crop&crop=center"
                      alt="Featured Drink"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 max-w-xs mx-auto">
          <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
            <ChefHat className="w-4 h-4" />
            <span>Jelajahi Resep</span>
          </button>
          <button className="bg-white/25 backdrop-blur-xl border border-white/40 text-slate-700 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
            <Play className="w-4 h-4" />
            <span>Video Tutorial</span>
          </button>
        </div>
      </div>

      <div className="hidden md:block relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Countdown */}
            <h1 className="text-xl font-semibold text-orange-400 drop-shadow mb-8">
              🎃 Halloween Countdown: {countdown}
            </h1>

            {/* Featured Myth Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl max-w-lg">
              <img 
                src="https://images.unsplash.com/photo-1485745631157-311b6f1f6e1c"
                alt="Featured Myth"
                className="w-full h-60 object-cover rounded-2xl mb-6"
              />

              <h2 className="text-4xl font-bold text-white mb-3">The Headless Horseman</h2>
              <p className="text-blue-200 text-lg mb-4">Featured Global Myth of the Month</p>

              <p className="text-slate-200 text-base leading-relaxed">
                A legendary apparition known for riding through fog-covered lands without
                a head, searching endlessly for the one who took it. A classic tale that
                appears in various forms throughout Europe and America.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}