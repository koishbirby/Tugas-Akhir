// src/components/recipe/RecipeDetail.jsx
import { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
} from "lucide-react";
import ConfirmModal from "../modals/ConfirmModal";
import FavoriteButton from "../common/FavoriteButton";

async function loadRecipeImages(recipeId) {
  const BUCKET = "recipe_images"; // <-- change if needed
  const FOLDER = `recipes/${recipeId}/`;

  // list all files in folder
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(FOLDER, {
      limit: 50,
      offset: 0,
    });

  if (error) {
    console.error("Image list error:", error);
    return [];
  }

  // Convert to public URLs
  return data.map((file) => {
    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(FOLDER + file.name).data.publicUrl;
  });
}

export default function RecipeDetail({
  recipeId,
  onBack,
  onEdit,
}) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadPost();
  }, [recipeId]);

  const loadPost = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id, title, content, author")
        .eq("id", recipeId)
        .single();

      if (fetchError) throw fetchError;
      setPost(data);
    } catch (err) {
      setError(err.message || "Gagal memuat post");
      console.error("Error loading post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      setDeleting(true);
      const { error: deleteError } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", recipeId);

      if (deleteError) throw deleteError;

      alert("Post berhasil dihapus!");
      setShowDeleteModal(false);
      if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Memuat post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
            <p className="text-red-500 mb-4">{error}</p>
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600">Post tidak ditemukan</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      {/* Author */}
      <p className="text-slate-500 mb-6">By {post.author || "Unknown"}</p>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <FavoriteButton
          isFavorited={isFavorited}
          onClick={() => setIsFavorited(!isFavorited)}
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

      {/* Content */}
      <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
        {post.content && (
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="whitespace-pre-wrap"
          />
        )}
      </div>

      {/* =============================
          IMAGE GALLERY
         ============================= */}
      {images.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform"
              >
                <img
                  src={img}
                  alt={`Recipe image ${idx + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Hapus Post"
          message="Apakah Anda yakin ingin menghapus post ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Hapus"
          cancelText="Batal"
          loading={deleting}
        />
      )}
    </div>
  );
}