// src/components/recipe/RecipeDetail.jsx
import { useState } from "react";
import { useRecipes } from "../../hooks/useRecipes";
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
  } = useRecipes(recipeId);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Hero Image */}
      {recipe.image && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Title & Meta */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <div className="flex flex-wrap gap-4 text-slate-600 mb-4">
          {recipe.prep_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{recipe.prep_time} min prep</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              <span>{recipe.cook_time} min cook</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          {recipe.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Rating */}
        {recipe.rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(recipe.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600">
              {recipe.rating.toFixed(1)} ({reviews?.length || 0} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <FavoriteButton
          isFavorited={isFavorited}
          onClick={handleToggleFavorite}
          loading={favLoading}
        />
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-slate-700">{recipe.description}</p>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bahan-bahan</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span className="text-slate-700">
                  {ingredient.quantity && <span className="font-semibold">{ingredient.quantity}</span>} {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps */}
      {recipe.steps && recipe.steps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Langkah-langkah</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="text-slate-700 pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Ulasan</h2>

        {/* Review Form */}
        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Ulasan
          </button>
        ) : (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Komentar</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis ulasan Anda..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {createLoading ? "Posting..." : "Post Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <p className="text-slate-600">Memuat ulasan...</p>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{review.user_identifier}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <p className="text-slate-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Belum ada ulasan. Jadilah yang pertama!</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Hapus Resep"
          message="Apakah Anda yakin ingin menghapus resep ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDeleteRecipe}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Hapus"
          cancelText="Batal"
          loading={deleting}
        />
      )}
    </div>
  );
}