// src/pages/HomePage.jsx
import { useRecipes } from '../hooks/useRecipes';
import HeroSection from '../components/home/HeroSection';
import FeaturedMakananSection from '../components/home/FeaturedMakananSection';
import FeaturedMinumanSection from '../components/home/FeaturedMinumanSection';
import RevealAnimation from '../components/common/RevealAnimation';

export default function HomePage({ onRecipeClick, onNavigate }) {
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
    <div className="relative min-h-screen bg-black">

      <img src="https://64.media.tumblr.com/45ee51c4f5844ded68c54ab9be6974bd/ccb00881f00f4107-1b/s500x750/8d5e6c2232724e113fa15f3817b3bc48b1c9a0c5.pnj" className="absolute top-4 left-4 w-36 opacity-70" />
      <img src="https://64.media.tumblr.com/45ee51c4f5844ded68c54ab9be6974bd/ccb00881f00f4107-1b/s500x750/8d5e6c2232724e113fa15f3817b3bc48b1c9a0c5.pnj" className="absolute top-4 right-4 w-36 opacity-70" />

      <RevealAnimation />

      <HeroSection />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Makanan Section */}
        <FeaturedMakananSection
          recipes={featuredMakanan}
          loading={loadingMakanan}
          error={errorMakanan}
          onRecipeClick={onRecipeClick}
          onNavigate={onNavigate}
        />

        {/* Featured Minuman Section */}
        <FeaturedMinumanSection
          recipes={featuredMinuman}
          loading={loadingMinuman}
          error={errorMinuman}
          onRecipeClick={onRecipeClick}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}