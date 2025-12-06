// src/components/recipe/RecipeDetail.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../config/supabaseClient";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ConfirmModal from "../modals/ConfirmModal";
import FavoriteButton from "../common/FavoriteButton";

const BUCKET_NAME = "blog_images"; // <-- change this to your bucket name if needed
const STORAGE_FOLDER_PREFIX = (id) => `recipes/${id}/`; // folder fallback

export default function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]); // array of public URLs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  async function loadPost() {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select("id, title, content, author, images")
        .eq("id", recipeId)
        .single();

      if (fetchError) throw fetchError;
      setPost(data);

      // If DB already contains images (array of URLs or paths), use them.
      if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
        const resolved = await resolveImageUrls(data.images, recipeId);
        setImages(resolved);
      } else {
        // Fallback: try listing storage folder recipes/{recipeId}/
        const listed = await listImagesFromStorage(recipeId);
        setImages(listed);
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err.message || "Gagal memuat post");
    } finally {
      setLoading(false);
    }
  }

  // If stored values are already full URLs -> use them.
  // If stored values are paths inside bucket (e.g., "recipes/123/img.jpg" or "img.jpg"), attempt to create public URL.
  async function resolveImageUrls(storedArray, recipeId) {
    const out = [];
    for (const item of storedArray) {
      if (!item) continue;
      // already an http(s) url?
      if (typeof item === "string" && (item.startsWith("http://") || item.startsWith("https://"))) {
        out.push(item);
        continue;
      }

      // if value looks like a path, try multiple guess patterns
      // 1) absolute path in bucket: item
      // 2) folder pattern: recipes/{recipeId}/{item}
      // 3) root filename: {item}
      const candidates = [];
      candidates.push(item);
      candidates.push(STORAGE_FOLDER_PREFIX(recipeId) + item);
      candidates.push(item.replace(/^\/+/, "")); // trim leading slash

      let foundUrl = null;
      for (const path of candidates) {
        try {
          const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          if (data?.publicUrl) {
            foundUrl = data.publicUrl;
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }
      if (foundUrl) out.push(foundUrl);
    }
    return out;
  }

  // List files from storage folder and return public URLs
  async function listImagesFromStorage(recipeId) {
    try {
      const folder = STORAGE_FOLDER_PREFIX(recipeId);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder, { limit: 100, offset: 0 });

      if (error) {
        // If folder doesn't exist or bucket missing, log and return []
        console.warn("Storage list warning:", error.message || error);
        return [];
      }

      // Build public URL for each file
      const urls = data.map((file) => {
        const fullPath = folder + file.name;
        const { data: getUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
        return getUrlData?.publicUrl || null;
      }).filter(Boolean);

      return urls;
    } catch (err) {
      console.error("Error listing storage images:", err);
      return [];
    }
  }

  // DELETE POST
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
      if (onBack) onBack();
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err.message || "Terjadi kesalahan saat menghapus post");
    } finally {
      setDeleting(false);
    }
  };

  // Lightbox controls
  const openLightboxAt = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

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
        <FavoriteButton isFavorited={isFavorited} onClick={() => setIsFavorited(!isFavorited)} />
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
          <div dangerouslySetInnerHTML={{ __html: post.content }} className="whitespace-pre-wrap" />
        )}
      </div>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => openLightboxAt(idx)}
                className="overflow-hidden rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform focus:outline-none"
                aria-label={`Open image ${idx + 1}`}
              >
                <img src={src} alt={`Image ${idx + 1}`} className="w-full h-48 object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-sm text-slate-500">Tidak ada gambar untuk ditampilkan.</div>
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

      {/* Simple Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/40 hover:bg-black/60"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={prevLightbox}
            className="absolute left-6 p-2 rounded-full bg-black/40 hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-[90%] max-h-[90%] flex items-center justify-center">
            <img
              src={images[lightboxIndex]}
              alt={`Lightbox ${lightboxIndex + 1}`}
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
          </div>

          <button
            onClick={nextLightbox}
            className="absolute right-6 p-2 rounded-full bg-black/40 hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
