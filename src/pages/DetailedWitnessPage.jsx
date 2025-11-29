// src/pages/WitnessDetailPage.jsx
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function WitnessDetailPage({ witness, onBack }) {
  // Mock images (replace with real ones if available)
  const proofImages = [
    "https://images.unsplash.com/photo-1606788075760-0b4f5f6f8d89?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=300&h=200&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-black/90 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-orange-400 hover:text-orange-500 flex items-center gap-1"
        >
          ← Kembali
        </button>
        <h1 className="font-bold text-xl">Witness Report Detail</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-orange-300">{witness.title}</h2>
        <p className="text-gray-200">{witness.description}</p>
        <p className="text-gray-400 italic">{witness.author}</p>

        {/* Proof Images */}
        <div className="flex flex-wrap gap-4 mt-4">
          {proofImages.map((src, index) => (
            <div key={index} className="w-[48%] md:w-[23%] rounded-lg overflow-hidden border border-white/20 shadow-lg">
              <img src={src} alt={`Proof ${index + 1}`} className="w-full h-32 object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
