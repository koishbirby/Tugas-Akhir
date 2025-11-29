import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { witnessReports } from "../../data/report";

export default function FeaturedWitnessSection({ setModalWitness }) {

  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setTimeout(() => {
            setVisibleCards(prev => new Set(prev).add(index));
          }, index * 200);
        }
      });
    }, { threshold: 0.15 });

    cardRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.dataset.index = i;
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-center text-orange-300 mb-10">
        👁️ Featured Myth Witness Reports
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center">
        {witnessReports.map((report, index) => (
          <motion.div
            key={report.id}
            ref={(el) => (cardRefs.current[index] = el)}
            initial={{ opacity: 0, y: 40 }}
            animate={visibleCards.has(index) ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl w-[300px] lg:w-[350px] h-[550px] cursor-pointer"
            onClick={() => setModalWitness(report)}
          >
            <img
              src={report.proofImages[0]}
              className="w-full h-[450px] object-cover rounded-xl mb-5"
            />

            <h2 className="text-2xl font-bold text-white text-center">
              {report.title}
            </h2>

            <p className="text-blue-300 text-center text-sm">
              {report.author}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
