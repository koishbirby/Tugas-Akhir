// src/pages/HomePage.jsx
import { useRecipes } from '../hooks/useRecipes';
import HeroSection from '../components/home/HeroSection';
import FeaturedCursedObjectsSection from '../components/home/FeaturedCursedObjectsSection';
import FeaturedMythsSection from '../components/home/FeaturedMythsSection';
import RevealAnimation from '../components/common/RevealAnimation';

export default function HomePage({ onRecipeClick, onNavigate }) {
  // Fetch featured cursed objects from API
  const { 
    recipes: featuredCursed,
    loading: loadingCursed,
    error: errorCursed
  } = useRecipes({
    category: 'cursedObjects',
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
        {/* Featured Cursed Objects Section */}
        <FeaturedCursedObjectsSection
          // recipes={featuredCursed}
          // loading={loadingCursed}
          // error={errorCursed}
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