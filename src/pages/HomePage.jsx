// src/pages/HomePage.jsx
import { useRecipes } from '../hooks/useRecipes';
import HeroSection from '../components/home/HeroSection';
import FeaturedMakananSection from '../components/home/FeaturedMakananSection';
import FeaturedMythsSection from '../components/home/FeaturedMythsSection';
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

  // Fetch featured myths from API
  const { 
    recipes: featuredMyths,
    loading: loadingMyths,
    error: errorMyths
  } = useRecipes({
    category: 'myths',
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
        <FeaturedMakananSection
          recipes={featuredMakanan}
          loading={loadingMakanan}
          error={errorMakanan}
          onRecipeClick={onRecipeClick}
          onNavigate={onNavigate}
        />

        {/* Featured Myths Section */}
        <FeaturedMythsSection
          // recipes={featuredMyths}
          // loading={loadingMyths}
          // error={errorMyths}
          onRecipeClick={onRecipeClick}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}