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

/**
 * Configuration
 */
const BUCKET_NAME = "blog_images"; // change if needed
const STORAGE_FOLDER_PREFIX = (id) => `recipes/${id}/`;

/**
 * Reaction emojis used in UI. Keys stored in DB are the emoji characters here.
 * You can replace these with short keys (like "like") if you prefer to store strings.
 */
const REACTION_OPTIONS = ["👍", "❤️", "😂", "😲", "😡"]; // order used in UI

/**
 * Helper: generate or read persistent anon id in localStorage
 */
function getOrCreateAnonId() {
  try {
    const key = "anon_reactor_id_v1";
    let id = localStorage.getItem(key);
    if (!id) {
      // generate reasonably unique id
      id = `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch (e) {
    // localStorage may be blocked; fall back to in-memory (won't persist)
    return `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export default function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]); // public URLs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // reaction state
  const [postCounts, setPostCounts] = useState({}); // { '👍': 3, '❤️': 1, ... }
  const [imageCounts, setImageCounts] = useState({}); // { imageUrl: { '👍': 2, ... } }
  const [anonPostReaction, setAnonPostReaction] = useState(null); // the anon_id's reaction for this post
  const [anonImageReactions, setAnonImageReactions] = useState({}); // { imageUrl: '👍' }

  // persistent anon id for this browser
  const anonId = getOrCreateAnonId();

  // -------------------------
  // Load post & images & reactions
  // -------------------------
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
      setPost(data || null);

      // resolve images from DB or storage fallback
      let resolvedImages = [];
      if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
        resolvedImages = await resolveImageUrls(data.images, recipeId);
      } else {
        resolvedImages = await listImagesFromStorage(recipeId);
      }
      setImages(resolvedImages);

      // load reaction counts + the anon's own reactions
      await loadReactions(resolvedImages, anonId);
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err?.message || "Gagal memuat post");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Image helpers
  // -------------------------
  async function resolveImageUrls(storedArray, recipeId) {
    const out = [];
    for (const item of storedArray) {
      if (!item) continue;
      if (typeof item === "string" && (item.startsWith("http://") || item.startsWith("https://"))) {
        out.push(item);
        continue;
      }

      // try a few candidate paths
      const candidates = [
        item,
        STORAGE_FOLDER_PREFIX(recipeId) + item,
        item.replace(/^\/+/, ""),
      ];

      let found = null;
      for (const path of candidates) {
        try {
          const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          if (data?.publicUrl) {
            found = data.publicUrl;
            break;
          }
        } catch (_) {}
      }
      if (found) out.push(found);
    }
    return out;
  }

  async function listImagesFromStorage(recipeId) {
    try {
      const folder = STORAGE_FOLDER_PREFIX(recipeId);
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, { limit: 100 });
      if (error || !Array.isArray(data)) return [];

      return data
        .map((f) => {
          const path = folder + f.name;
          const { data: getUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          return getUrlData?.publicUrl || null;
        })
        .filter(Boolean);
    } catch (err) {
      console.error("Error listing images:", err);
      return [];
    }
  }

  // -------------------------
  // Reactions: load counts and anon's own reactions
  // -------------------------
  async function loadReactions(resolvedImages = [], _anonId = anonId) {
    try {
      // POST reaction rows for this post
      const { data: postRows, error: postErr } = await supabase
        .from("reactions")
        .select("reaction_type, anon_id")
        .eq("post_id", recipeId);

      if (postErr) {
        console.warn("post reactions fetch error:", postErr);
      }

      // count grouping for post
      const postGrouped = {};
      (postRows || []).forEach((r) => {
        postGrouped[r.reaction_type] = (postGrouped[r.reaction_type] || 0) + 1;
      });
      setPostCounts(postGrouped);

      // determine this anon's reaction for the post (if any)
      const myPostRow = (postRows || []).find((r) => r.anon_id === _anonId);
      setAnonPostReaction(myPostRow ? myPostRow.reaction_type : null);

      // IMAGE reaction rows for images
      const imageGrouped = {};
      const myImageMap = {};
      if (Array.isArray(resolvedImages) && resolvedImages.length > 0) {
        // fetch all reactions for these image URLs
        const { data: imgRows, error: imgErr } = await supabase
          .from("reactions")
          .select("reaction_type, image_url, anon_id")
          .in("image_url", resolvedImages);

        if (imgErr) {
          console.warn("image reactions fetch warning:", imgErr);
        } else if (Array.isArray(imgRows)) {
          imgRows.forEach((r) => {
            if (!imageGrouped[r.image_url]) imageGrouped[r.image_url] = {};
            imageGrouped[r.image_url][r.reaction_type] =
              (imageGrouped[r.image_url][r.reaction_type] || 0) + 1;

            if (r.anon_id === _anonId) {
              myImageMap[r.image_url] = r.reaction_type;
            }
          });
        }
      }

      setImageCounts(imageGrouped);
      setAnonImageReactions(myImageMap);
    } catch (err) {
      console.error("Error loading reactions:", err);
    }
  }

  // -------------------------
  // Reactions: mutations for anonymous user (one reaction per anon_id per item)
  // - If anon already reacted with same emoji -> remove (toggle off)
  // - If anon already reacted with different emoji -> update
  // - Else -> insert
  // -------------------------
  async function handleReactPost(reactionType) {
    try {
      // find existing reaction by this anon for this post (if any)
      const { data: existingRows, error: existingErr } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("post_id", recipeId)
        .eq("anon_id", anonId)
        .limit(1)
        .maybeSingle();

      if (existingErr) {
        console.warn("check existing post reaction err:", existingErr);
      }

      const existing = existingRows || null;

      if (existing && existing.reaction_type === reactionType) {
        // remove
        const { error: delErr } = await supabase.from("reactions").delete().eq("id", existing.id);
        if (delErr) throw delErr;
      } else if (existing) {
        // update
        const { error: updErr } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
        if (updErr) throw updErr;
      } else {
        // insert new
        const { error: insErr } = await supabase.from("reactions").insert({
          post_id: recipeId,
          reaction_type: reactionType,
          anon_id: anonId,
          image_url: null,
        });
        if (insErr) throw insErr;
      }

      // reload counts & own reaction
      await loadReactions(images, anonId);
    } catch (err) {
      console.error("React post error:", err);
      alert("Gagal menambahkan reaksi (post).");
    }
  }

  async function handleReactImage(imageUrl, reactionType) {
    try {
      // find existing reaction by this anon for this image (if any)
      const { data: existingRows, error: existingErr } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("image_url", imageUrl)
        .eq("anon_id", anonId)
        .limit(1)
        .maybeSingle();

      if (existingErr) {
        console.warn("check existing image reaction err:", existingErr);
      }

      const existing = existingRows || null;

      if (existing && existing.reaction_type === reactionType) {
        // remove
        const { error: delErr } = await supabase.from("reactions").delete().eq("id", existing.id);
        if (delErr) throw delErr;
      } else if (existing) {
        // update
        const { error: updErr } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
        if (updErr) throw updErr;
      } else {
        // insert new
        const { error: insErr } = await supabase.from("reactions").insert({
          image_url: imageUrl,
          reaction_type: reactionType,
          anon_id: anonId,
          post_id: null,
        });
        if (insErr) throw insErr;
      }

      await loadReactions(images, anonId);
    } catch (err) {
      console.error("React image error:", err);
      alert("Gagal menambahkan reaksi (gambar).");
    }
  }

  // -------------------------
  // Delete post
  // -------------------------
  const handleDeletePost = async () => {
    try {
      setDeleting(true);
      const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", recipeId);
      if (deleteError) throw deleteError;

      alert("Post berhasil dihapus!");
      setShowDeleteModal(false);
      if (onBack) onBack();
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err?.message || "Terjadi kesalahan saat menghapus post");
    } finally {
      setDeleting(false);
    }
  };

  // -------------------------
  // Lightbox controls
  // -------------------------
  const openLightboxAt = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

  // -------------------------
  // render states
  // -------------------------
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
            <button onClick={onBack} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
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
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Title & author */}
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-slate-500 mb-4">By {post.author || "Unknown"}</p>

      {/* Post Reactions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {REACTION_OPTIONS.map((emoji) => {
          const count = postCounts[emoji] || 0;
          const active = anonPostReaction === emoji;
          return (
            <button
              key={emoji}
              onClick={() => handleReactPost(emoji)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"}`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs text-slate-500">× {count}</span>
            </button>
          );
        })}
      </div>
        {/* smth */}
      {/* Gallery */}
      {images.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, idx) => {
              const counts = imageCounts[src] || {};
              const myReaction = anonImageReactions[src] || null;
              return (
                <div key={src} className="relative group">
                  <button
                    onClick={() => openLightboxAt(idx)}
                    className="overflow-hidden rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform w-full block"
                    aria-label={`Open image ${idx + 1}`}
                  >
                    <img src={src} alt={`Image ${idx + 1}`} className="w-full h-48 object-cover rounded-xl" />
                  </button>

                  <div className="mt-2 flex gap-2">
                    {REACTION_OPTIONS.slice(0, 3).map((emoji) => {
                      const active = myReaction === emoji;
                      const c = counts[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReactImage(src, emoji)}
                          className={`flex items-center gap-2 px-2 py-1 rounded-full text-sm ${active ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"} border`}
                        >
                          <span>{emoji}</span>
                          <span className="text-xs">{c}</span>
                        </button>
                      );
                    })}
                    {/* summary for more reactions */}
                    {Object.keys(counts).length > 3 && (
                      <div className="ml-1 px-2 py-1 rounded-full bg-white/90 text-xs border">
                        +{Object.values(counts).reduce((a, b) => a + b, 0) - ((counts[REACTION_OPTIONS[0]] || 0) + (counts[REACTION_OPTIONS[1]] || 0) + (counts[REACTION_OPTIONS[2]] || 0))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-sm text-slate-500">Tidak ada gambar untuk ditampilkan.</div>
      )}

      {/* action buttons */}
      <div className="flex gap-3 mb-8 mt-8">
        <FavoriteButton isFavorited={isFavorited} onClick={() => setIsFavorited(!isFavorited)} />

        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" /> Edit
          </button>
        )}

        <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* content */}
      <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* delete modal */}
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

      {/* lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75" role="dialog" aria-modal="true">
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 rounded-full bg-black/40 hover:bg-black/60" aria-label="Close">
            <X className="w-6 h-6 text-white" />
          </button>

          <button onClick={prevLightbox} className="absolute left-6 p-2 rounded-full bg-black/40 hover:bg-black/60" aria-label="Previous">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-[90%] max-h-[90%] flex items-center justify-center">
            <img src={images[lightboxIndex]} alt={`Lightbox ${lightboxIndex + 1}`} className="max-h-[90vh] max-w-full object-contain rounded-lg" />
          </div>

          <button onClick={nextLightbox} className="absolute right-6 p-2 rounded-full bg-black/40 hover:bg-black/60" aria-label="Next">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
