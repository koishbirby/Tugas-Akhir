// src/components/recipe/RecipeDetail.jsx
import { useState } from "react";
import { useRecipe } from "../../hooks/useRecipes";
import { useReviews, useCreateReview } from "../../hooks/useReviews";
import { useIsFavorited } from "../../hooks/useFavorites";
import { getUserIdentifier } from "../../hooks/useFavorites";
import {
  formatDate,
  getDifficultyColor,
  getStarRating,
} from "../../Utils/helpers";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  ChefHat,
  Star,
  Send,
  Edit,
  Trash2,
} from "lucide-react";
import recipeService from "../../services/recipeService";
import ConfirmModal from "../modals/ConfirmModal";
import FavoriteButton from "../common/FavoriteButton";
import userService from "../../services/userService";

export default function RecipeDetail({
  recipeId,
  onBack,
  onEdit,
  category = "makanan",
}) {
  const {
    recipe,
    loading: recipeLoading,
    error: recipeError,
  } = useRecipe(recipeId);
  const {
    reviews,
    loading: reviewsLoading,
    refetch: refetchReviews,
  } = useReviews(recipeId);
  const { createReview, loading: createLoading } = useCreateReview();
  const {
    isFavorited,
    loading: favLoading,
    toggleFavorite,
  } = useIsFavorited(recipeId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoryColors = {
    makanan: {
      primary: "blue",
      gradient: "from-blue-50 via-white to-indigo-50",
      text: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-400",
      hover: "hover:bg-blue-50",
      ring: "ring-blue-500",
    },
    minuman: {
      primary: "green",
      gradient: "from-green-50 via-white to-cyan-50",
      text: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-400",
      hover: "hover:bg-green-50",
      ring: "ring-green-500",
    },
  };

  const colors = categoryColors[category] || categoryColors.makanan;

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Get username from user profile
    const userProfile = userService.getUserProfile();

    const reviewData = {
      user_identifier: userProfile.username || getUserIdentifier(),
      rating,
      comment: comment.trim(),
    };

    const success = await createReview(recipeId, reviewData);

    if (success) {
      setComment("");
      setRating(5);
      setShowReviewForm(false);
      refetchReviews();
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite();
  };

  const handleDeleteRecipe = async () => {
    try {
      setDeleting(true);
      const result = await recipeService.deleteRecipe(recipeId);

      if (result.success) {
        alert("Resep berhasil dihapus!");
        setShowDeleteModal(false);
        if (onBack) {
          onBack();
        }
      } else {
        throw new Error(result.message || "Gagal menghapus resep");
      }
    } catch (err) {
      console.error("Delete recipe error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus resep");
    } finally {
      setDeleting(false);
    }
  };

  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 border-${colors.primary}-600 mx-auto`}
          ></div>
          <p className="mt-4 text-slate-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (recipeError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
            <p className="text-red-500 mb-4">{recipeError}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600">Resep tidak ditemukan</p>
          <button
            onClick={onBack}
            className={`mt-4 px-4 py-2 bg-${colors.primary}-600 text-white rounded-lg hover:bg-${colors.primary}-700 transition-colors`}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(recipeId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Blog Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {recipe.title}
        </h1>

        {/* Author + Date */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <p className="font-semibold text-gray-800">{recipe.author || "Unknown Author"}</p>
            <p className="text-gray-500 text-sm">{formatDate(recipe.created_at)}</p>
          </div>
        </div>

        {/* Featured Image (optional, safe even if missing) */}
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full rounded-xl mb-10 shadow-md"
          />
        )}

        {/* Blog Content */}
        <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: recipe.content }} />
        </article>
      </main>
    </div>
  );
}
