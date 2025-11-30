// src/components/home/HeroSection.jsx
import { useState, useEffect } from "react";
import { ChefHat, Play, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import WitnessPopUp from '../modals/WitnessModal';

export default function HeroSection() {
  const [modalWitness, setModalWitness] = useState(null);

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

      {/* MOBILE — Featured Myth Section (Matches Desktop) */}
      <div className="md:hidden relative z-10 w-full px-4 py-10">

        {/* Countdown Mobile */}
        <h1 className="text-lg font-semibold text-orange-400 text-center drop-shadow mb-10">
          🎃 Halloween Countdown: {countdown}
        </h1>

        {/* Tarot Card — Mobile */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl 
                    w-full max-w-sm mx-auto mb-8 cursor-pointer"
          onClick={() =>
            setModalWitness({
              title: "The Headless Horseman",
              description:
                "I saw it on a foggy October night — a rider with no head, galloping through the old forest road. The horse's eyes burned like embers, and the sound of hooves echoed long after it passed.",
              author: "- Anonymous Villager, 1823",
              proofImages: [
                "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
              ]
            })
          }
        >
          <img 
            src="https://images.unsplash.com/photo-1485745631157-311b6f1f6e1c"
            className="w-full h-[420px] object-cover rounded-xl mb-5"
          />
          <h2 className="text-xl font-bold text-white text-center mb-1">
            The Headless Horseman
          </h2>
          <p className="text-blue-300 text-center text-sm">
            Global Myth
          </p>
        </motion.div>


        {/* Witness Report — Mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl 
                    w-full max-w-sm mx-auto p-5 cursor-pointer"
          onClick={() =>
            setModalWitness({
              title: "Witness Report",
              description:
                "I saw it on a foggy October night — a rider with no head, galloping through the old forest road. The horse's eyes burned like embers, and the sound of hooves echoed long after it passed. I don't know what it wanted… but I pray we never meet again.",
              author: "- Anonymous Villager, 1823",
              proofImages: [
                "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
                "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
              ]
            })
          }
        >
          <h3 className="text-2xl font-semibold text-orange-300 mb-4">
            📜 Witness Report
          </h3>

          <p className="text-slate-200 leading-relaxed mb-4 line-clamp-4">
            “I saw it on a foggy October night — a rider with no head, galloping through 
            the old forest road. The horse's eyes burned like embers, and the sound of 
            hooves echoed long after it passed. I don't know what it wanted… but I pray 
            we never meet again.”
          </p>

          <p className="text-slate-400 text-sm italic mb-3">
            - Anonymous Villager, 1823
          </p>

          {/* Proof images mobile */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[
              "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
              "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
              "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
              "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
            ].map((src, index) => (
              <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                <img 
                  src={src}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>

      </div>


      <div className="hidden md:block relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center gap-10 mt-6 flex-wrap">
          
          {/* Left Content */}
          <div className="flex flex-col items-center text-center">
            
            {/* Countdown */}
            <h1 className="text-xl font-semibold text-orange-400 drop-shadow mb-8">
              🎃 Halloween Countdown: {countdown}
            </h1>

            {/* Featured Myth Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 justify-items-center">

              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl w-[260px] h-[500px]"

              >
                <img 
                  src="https://images.unsplash.com/photo-1485745631157-311b6f1f6e1c"
                  className="w-full h-60 object-cover rounded-xl mb-4"
                />
                <h2 className="text-xl font-bold text-white mb-2">The Headless Horseman</h2>
                <p className="text-blue-200 text-sm">Global Myth</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl w-[260px] h-[500px]"

              >
                <img 
                  src="https://images.unsplash.com/photo-1489657780376-e0d8630c2f76"
                  className="w-full h-60 object-cover rounded-xl mb-4"
                />
                <h2 className="text-xl font-bold text-white mb-2">The Banshee</h2>
                <p className="text-blue-200 text-sm">Irish Folklore</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl w-[260px] h-[500px]"

              >
                <img 
                  src="https://images.unsplash.com/photo-1593113830409-1b4c1b945cbb"
                  className="w-full h-60 object-cover rounded-xl mb-4"
                />
                <h2 className="text-xl font-bold text-white mb-2">The Wendigo</h2>
                <p className="text-blue-200 text-sm">North American Legend</p>
              </motion.div>

            </div> */}
            {/* Featured Myth Section (Tarot Card + Report) */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10 mt-10">

              {/* Tarot Card */}
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl w-[300px] lg:w-[350px] h-[550px] flex flex-col cursor-pointer"
                onClick={() =>
                  setModalWitness({
                    title: "The Headless Horseman",
                    description:
                      "I saw it on a foggy October night — a rider with no head, galloping through the old forest road. The horse's eyes burned like embers, and the sound of hooves echoed long after it passed.",
                    author: "- Anonymous Villager, 1823",
                    proofImages: [
                      "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
                    ]
                  })
                }
              >
                <img 
                  src="https://images.unsplash.com/photo-1485745631157-311b6f1f6e1c"
                  className="w-full h-[450px] object-cover rounded-xl mb-5"
                />
                <h2 className="text-2xl font-bold text-white text-center mb-1">
                  The Headless Horseman
                </h2>
                <p className="text-blue-300 text-center text-sm">
                  Global Myth
                </p>
              </motion.div>

              {/* Witness Report Panel */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full lg:w-[450px] p-8 max-h-[550px] overflow-y-auto cursor-pointer"
                onClick={() =>
                  setModalWitness({
                    title: "Witness Report",
                    description:
                      "I saw it on a foggy October night — a rider with no head, galloping through the old forest road. The horse's eyes burned like embers, and the sound of hooves echoed long after it passed. I don't know what it wanted… but I pray we never meet again.",
                    author: "- Anonymous Villager, 1823",
                    proofImages: [
                      "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
                      "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
                    ]
                  })
                }
              >
                <h3 className="text-2xl font-semibold text-orange-300 mb-4">
                  📜 Witness Report
                </h3>
                <p className="text-slate-200 leading-relaxed mb-4 line-clamp-3">
                  “I saw it on a foggy October night — a rider with no head, galloping 
                  through the old forest road. The horse's eyes burned like embers, 
                  and the sound of hooves echoed long after it passed. I don't know what it wanted… but I pray we never meet again.”
                </p>
                <p className="text-slate-400 text-sm italic mb-2">
                  - Anonymous Villager, 1823
                </p>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {[
                    "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=200&h=150&fit=crop",
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop",
                    "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=200&h=150&fit=crop",
                    "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=200&h=150&fit=crop"
                  ].map((src, index) => (
                    <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                      <img 
                        src={src}
                        alt={`Proof ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Featured Myth Card */}
            {/* <motion.div
              initial={{ opacity: 0, y: -40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl max-w-lg"
            >

              <img 
                src="https://images.unsplash.com/photo-1485745631157-311b6f1f6e1c"
                alt="Featured Myth"
                className="w-full h-100 object-cover rounded-2xl mb-6"
              />

              <h2 className="text-2xl font-bold text-white mb-3">The Headless Horseman</h2>
              <p className="text-blue-200 text-lg mb-4">Featured Global Myth of the Month</p>

              <p className="text-slate-200 text-base leading-relaxed">
                A legendary apparition known for riding through fog-covered lands without
                a head, searching endlessly for the one who took it. A classic tale that
                appears in various forms throughout Europe and America.
              </p>
            </motion.div> */}
          </div>
        </div>
      </div>
      {modalWitness && (
        <WitnessPopUp 
          witness={modalWitness} 
          onClose={() => setModalWitness(null)} 
        />
      )}
    </section>
  );
}