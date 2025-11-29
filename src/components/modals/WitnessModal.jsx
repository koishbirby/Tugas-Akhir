// src/components/WitnessModal.jsx
import { motion } from "framer-motion";

export default function WitnessModal({ witness, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-black/90 text-white rounded-2xl max-w-3xl w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold text-orange-300">{witness.title}</h2>
        <p className="mt-4 text-gray-200">{witness.description}</p>
        <p className="text-gray-400 italic mt-2">{witness.author}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {witness.proofImages?.map((src, idx) => (
            <div key={idx} className="w-[48%] md:w-[23%] rounded-lg overflow-hidden border border-white/20">
              <img src={src} alt={`Proof ${idx + 1}`} className="w-full h-32 object-cover" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
