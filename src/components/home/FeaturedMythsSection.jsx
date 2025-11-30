import { useState, useEffect, useRef } from 'react';
import { witnessReports } from "../../data/report";
import { BookText, Image as ImageIcon } from "lucide-react";
import WitnessPopUp from '../modals/WitnessModal';

export default function FeaturedMythsSection() {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  const [modalMyth, setModalMyth] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = parseInt(entry.target.dataset.index);
          setTimeout(() => {
            setVisibleCards(prev => new Set(prev).add(i));
          }, i * 250);
        }
      });
    }, { threshold: 0.1 });

    cardRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.dataset.index = i;
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-white">Featured Myth Reports</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {witnessReports.map((report, index) => (
          <div
            key={report.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`group transform transition-all duration-700 ${
              visibleCards.has(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div
              onClick={() => setModalMyth(report)}
              className="relative bg-white/10 backdrop-blur-xl border border-white/20
                rounded-2xl overflow-hidden shadow-xl hover:bg-white/20 
                hover:scale-[1.02] cursor-pointer transition-all"
            >
              <div className="flex">
                <div className="h-28 w-28 md:h-48 md:w-48 overflow-hidden">
                  <img
                    src={report.proofImages?.[0]}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                <div className="flex-1 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold bg-purple-900/40 px-3 py-1 rounded-full text-purple-200">
                      Myth Report
                    </span>

                    <div className="flex items-center gap-1 text-xs text-purple-200">
                      <ImageIcon className="w-3 h-3" />
                      {report.proofImages.length}
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-purple-300 transition">
                    {report.title}
                  </h3>

                  <p className="text-purple-200 text-sm italic mb-2 line-clamp-1">
                    {report.author}
                  </p>

                  <p className="text-gray-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMyth && (
        <WitnessPopUp
          modal={modalMyth}
          onClose={() => setModalMyth(null)}
        />
      )}
    </section>
  );
}
