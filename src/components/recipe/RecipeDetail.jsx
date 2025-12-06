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

const BUCKET_NAME = "blog_images";
const STORAGE_FOLDER_PREFIX = (id) => `recipes/${id}/`;

export default function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reaction counts
  const [postCounts, setPostCounts] = useState({});
  const [imageCounts, setImageCounts] = useState({});

  useEffect(() => {
    loadPost();
  }, [recipeId]);

  // ------------------------------
  // LOAD POST + IMAGES
  // ------------------------------
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

      let resolvedImages = [];

      if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
        resolvedImages = await resolveImageUrls(data.images, recipeId);
        setImages(resolvedImages);
      } else {
        resolvedImages = await listImagesFromStorage(recipeId);
        setImages(resolvedImages);
      }

      await loadReactions(resolvedImages);
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err.message || "Gagal memuat post");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // RESOLVE IMAGE URLS
  // ------------------------------
  async function resolveImageUrls(storedArray, recipeId) {
    const out = [];
    for (const item of storedArray) {
      if (!item) continue;

      if (typeof item === "string" && (item.startsWith("http://") || item.startsWith("https://"))) {
        out.push(item);
        continue;
      }

      const candidates = [
        item,
        STORAGE_FOLDER_PREFIX(recipeId) + item,
        item.replace(/^\/+/, "")
      ];

      let foundUrl = null;
      for (const path of candidates) {
        try {
          const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          if (data?.publicUrl) {
            foundUrl = data.publicUrl;
            break;
          }
        } catch (_) {}
      }

      if (foundUrl) out.push(foundUrl);
    }
    return out;
  }

  // ------------------------------
  // LIST IMAGES FROM STORAGE
  // ------------------------------
  async function listImagesFromStorage(recipeId) {
    try {
      const folder = STORAGE_FOLDER_PREFIX(recipeId);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder, { limit: 100, offset: 0 });

      if (error) return [];

      return data
        .map((file) => {
          const fullPath = folder + file.name;
          const { data: getUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
          return getUrlData?.publicUrl || null;
        })
        .filter(Boolean);
    } catch (err) {
      console.error("Error listing storage images:", err);
      return [];
    }
  }

  // ------------------------------
  // DELETE POST
  // ------------------------------
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

  // ------------------------------
  // REACTIONS — NO LOGIN REQUIRED
  // ------------------------------
  async function loadReactions(resolvedImages = images) {
    try {
      // Post reactions
      const { data: allPostRows } = await supabase
        .from("reactions")
        .select("reaction_type")
        .eq("post_id", recipeId);

      const postGrouped = {};
      allPostRows?.forEach((r) => {
        postGrouped[r.reaction_type] = (postGrouped[r.reaction_type] || 0) + 1;
      });
      setPostCounts(postGrouped);

      // Image reactions
      if (resolvedImages.length > 0) {
        const { data: imgRows } = await supabase
          .from("reactions")
          .select("reaction_type, image_url")
          .in("image_url", resolvedImages);

        const imageGrouped = {};
        imgRows?.forEach((r) => {
          if (!imageGrouped[r.image_url]) imageGrouped[r.image_url] = {};
          imageGrouped[r.image_url][r.reaction_type] =
            (imageGrouped[r.image_url][r.reaction_type] || 0) + 1;
        });

        setImageCounts(imageGrouped);
      }
    } catch (err) {
      console.error("Error loading reactions:", err);
    }
  }

  // Add reaction to post
  async function handleReactPost(type) {
    try {
      await supabase.from("reactions").insert({
        post_id: recipeId,
        reaction_type: type,
        user_id: null,
      });

      await loadReactions(images);
    } catch (err) {
      console.error("React post error:", err);
      alert("Gagal menambahkan reaksi");
    }
  }

  // Add reaction to image
  async function handleReactImage(url, type) {
    try {
      await supabase.from("reactions").insert({
        image_url: url,
        reaction_type: type,
        user_id: null,
      });

      await loadReactions(images);
    } catch (err) {
      console.error("React image error:", err);
      alert("Gagal menambahkan reaksi");
    }
  }

  // ------------------------------
  // LIGHTBOX
  // ------------------------------
  const openLightboxAt = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

  // ------------------------------
  // RENDER
  // ------------------------------

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

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-slate-500 mb-6">By {post.author || "Unknown"}</p>

      {/* Post Reaction Buttons */}
      <div className="flex gap-4 mb-8">
        {["👍", "❤️", "🔥"].map((r) => (
          <button
            key={r}
            onClick={() => handleReactPost(r)}
            className="px-3 py-2 text-xl border rounded-lg"
          >
            {r} {postCounts[r] || 0}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {images.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <button
                  onClick={() => openLightboxAt(idx)}
                  className="overflow-hidden rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform"
                >
                  <img src={src} alt="" className="w-full h-48 object-cover" />
                </button>

                {/* Image reactions */}
                <div className="flex gap-2">
                  {["👍", "❤️", "🔥"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleReactImage(src, r)}
                      className="px-2 py-1 border rounded text-lg"
                    >
                      {r} {(imageCounts[src]?.[r] || 0)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-sm text-slate-500">Tidak ada gambar untuk ditampilkan.</div>
      )}

      {/* Edit/Delete */}
      <div className="flex gap-3 mb-8 mt-8">
        <FavoriteButton isFavorited={isFavorited} onClick={() => setIsFavorited(!isFavorited)} />

        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
        )}

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Hapus Post"
          message="Apakah Anda yakin ingin menghapus post ini?"
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteModal(false)}
          confirmText="Hapus"
          cancelText="Batal"
          loading={deleting}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2">
            <X className="w-6 h-6 text-white" />
          </button>

          <button onClick={prevLightbox} className="absolute left-6 p-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <img
            src={images[lightboxIndex]}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />

          <button onClick={nextLightbox} className="absolute right-6 p-2">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
