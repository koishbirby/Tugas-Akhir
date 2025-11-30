// src/components/common/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import FavoriteService from '../../services/favoriteService';
import userService from '../../services/userService';

/**
 * FavoriteButton Component
 * Toggles favorite status with Supabase support
 */
export default function FavoriteButton({ recipeId, showCount = false, initialCount = 0, size = 'md' }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const userIdentifier = userService.getUserIdentifier();

  // Size variants
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Load favorite status from Supabase on mount
  useEffect(() => {
    async function fetchFavorite() {
      if (!userIdentifier) return;

      try {
        const res = await FavoriteService.isFavorited(recipeId, userIdentifier);
        if (res.success) setIsFavorited(res.data.isFavorited);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    }

    fetchFavorite();
  }, [recipeId, userIdentifier]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Optimistic UI update
    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);
    setFavoriteCount(prev => newFavoritedState ? prev + 1 : Math.max(0, prev - 1));

    // Update Supabase
    if (!userIdentifier) return;
    try {
      await FavoriteService.toggleFavorite({ post_id: recipeId, user_identifier: userIdentifier });
    } catch (err) {
      console.error('Failed to toggle favorite in database:', err);
      // Revert UI if error
      setIsFavorited(!newFavoritedState);
      setFavoriteCount(prev => newFavoritedState ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizes[size]} rounded-full flex items-center justify-center gap-1.5
        transition-all duration-200
        ${isFavorited 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
        ${isAnimating ? 'scale-125' : 'scale-100'}
        group
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`
          ${iconSizes[size]} 
          transition-all duration-200
          ${isFavorited ? 'fill-current' : ''}
          ${isAnimating ? 'animate-pulse' : ''}
        `}
      />
      {showCount && favoriteCount > 0 && (
        <span className="text-xs font-semibold">
          {favoriteCount > 999 ? '999+' : favoriteCount}
        </span>
      )}
    </button>
  );
}
