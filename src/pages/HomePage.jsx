// src/pages/HomePage.jsx
import { useRecipes } from '../hooks/useRecipes';
import HeroSection from '../components/home/HeroSection';
import FeaturedMakananSection from '../components/home/FeaturedMakananSection';
import FeaturedWitnessSection from '../components/home/FeaturedWitnessSection';
import RevealAnimation from '../components/common/RevealAnimation';
import { useState } from 'react';
import WitnessModal from '../components/modals/WitnessModal';

export default function HomePage({ onRecipeClick, onNavigate }) {
  const [modalWitness, setModalWitness] = useState(null);
  // Fetch featured makanan (food) recipes from API
  const { 
    recipes: featuredMakanan, 
    loading: loadingMakanan,
    error: errorMakanan 
  } = useRecipes({
    category: 'makanan',
    limit: 3,
    sort_by: 'created_at',
    order: 'desc'
  });

  // Fetch featured minuman (drinks) recipes from API
  const { 
    recipes: featuredMinuman,
    loading: loadingMinuman,
    error: errorMinuman
  } = useRecipes({
    category: 'minuman',
    limit: 2,
    sort_by: 'created_at',
    order: 'desc'
  });

  return (
    <div className="min-h-screen bg-black">

      {/* <RevealAnimation /> */}

      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Makanan Section */}
        {/* <FeaturedMakananSection
          recipes={featuredMakanan}
          loading={loadingMakanan}
          error={errorMakanan}
          onRecipeClick={onRecipeClick}
          onNavigate={onNavigate}
        /> */}

        {/* Featured Witness Section */}
        <FeaturedWitnessSection setModalWitness={setModalWitness} />
      </div>
      {modalWitness && (
        <WitnessModal
          witness={modalWitness}
          onClose={() => setModalWitness(null)}
        />
      )}
    </div>
  );
}