// src/components/recipe/RecipeDetail.jsx
import { useState, useEffect, useCallback } from "react";
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
 * Allowed reactions and small emoji mapping for UI
 */
const REACTIONS = [
  { key: "like", label: "Like", emoji: "👍" },
  { key: "love", label: "Love", emoji: "❤️" },
  { key: "wow", label: "Wow", emoji: "😲" },
  { key: "funny", label: "Funny", emoji: "😂" },
  { key: "angry", label: "Angry", emoji: "😡" },
];

export default function RecipeDetail({ recipeId, onBack, onEdit }) {
  const [post, setPost] = useState(null);
  const [images, setImages] = useState([]); // public URLs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reactions
  const [postCounts, setPostCounts] = useState({}); // { like: 3, love: 1, ... }
  const [imageCounts, setImageCounts] = useState({}); // { [imageUrl]: { like: 2, ... } }
  const [userPostReaction, setUserPostReaction] = useState(null); // string or null
  const [userImageReactions, setUserImageReactions] = useState({}); // { [imageUrl]: 'like' }

  // get current user helper
  const getCurrentUser = useCallback(async () => {
    try {
      const res = await supabase.auth.getUser();
      return res?.data?.user ?? null;
    } catch (e) {
      return null;
    }
  }, []);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  // -------------------------
  // LOAD POST + IMAGES + REACTIONS
  // -------------------------
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

      // Resolve images
      let resolvedImages = [];
      if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
        resolvedImages = await resolveImageUrls(data.images, recipeId);
      } else {
        resolvedImages = await listImagesFromStorage(recipeId);
      }
      setImages(resolvedImages);

      // Load reaction counts & user reactions
      await loadReactions(resolvedImages);
    } catch (err) {
      console.error("Error loading post:", err);
      setError(err?.message || "Gagal memuat post");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // IMAGE HELPERS
  // -------------------------
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
        item.replace(/^\/+/, ""),
      ];

      let foundUrl = null;
      for (const path of candidates) {
        try {
          const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
          if (data?.publicUrl) {
            foundUrl = data.publicUrl;
            break;
          }
        } catch (e) {
          // ignore
        }
      }
      if (foundUrl) out.push(foundUrl);
    }
    return out;
  }

  async function listImagesFromStorage(recipeId) {
    try {
      const folder = STORAGE_FOLDER_PREFIX(recipeId);
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, { limit: 100 });
      if (error) {
        console.warn("Storage list warning:", error.message || error);
        return [];
      }
      const urls = data
        .map((file) => {
          const fullPath = folder + file.name;
          const { data: getUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
          return getUrlData?.publicUrl || null;
        })
        .filter(Boolean);
      return urls;
    } catch (err) {
      console.error("Error listing storage images:", err);
      return [];
    }
  }

  // -------------------------
  // REACTIONS: LOAD
  // -------------------------
  async function loadReactions(resolvedImages = images) {
    try {
      // 1) Post reaction counts
      const { data: postData } = await supabase
        .from("reactions")
        .select("reaction_type, count:reaction_type")
        .eq("post_id", recipeId);

      // The above simple select won't give grouped counts in Supabase easily.
      // We'll fetch all rows and group in JS for reliability.
      const { data: allPostRows } = await supabase
        .from("reactions")
        .select("reaction_type,user_id")
        .eq("post_id", recipeId);

      const postGrouped = {};
      if (Array.isArray(allPostRows)) {
        allPostRows.forEach((r) => {
          postGrouped[r.reaction_type] = (postGrouped[r.reaction_type] || 0) + 1;
        });
      }
      setPostCounts(postGrouped);

      // 2) Image reactions - fetch reactions for images in array
      const imageGrouped = {};
      if (Array.isArray(resolvedImages) && resolvedImages.length > 0) {
        // Supabase doesn't allow .in for empty array, so guard
        const { data: imgRows, error: imgErr } = await supabase
          .from("reactions")
          .select("reaction_type,image_url,user_id")
          .in("image_url", resolvedImages);

        if (imgErr) {
          console.warn("image reactions fetch warning:", imgErr);
        } else if (Array.isArray(imgRows)) {
          imgRows.forEach((r) => {
            if (!imageGrouped[r.image_url]) imageGrouped[r.image_url] = {};
            imageGrouped[r.image_url][r.reaction_type] =
              (imageGrouped[r.image_url][r.reaction_type] || 0) + 1;
          });
        }
      }
      setImageCounts(imageGrouped);

      // 3) Load user's own reactions (post + images)
      const user = await getCurrentUser();
      if (user) {
        const { data: userRows } = await supabase
          .from("reactions")
          .select("reaction_type,post_id,image_url")
          .eq("user_id", user.id)
          .or(
            `post_id.eq.${recipeId}` + // post reaction
            (resolvedImages.length > 0 ? `,image_url.in.(${resolvedImages.map((u) => `'${u}'`).join(",")})` : "")
          );

        // The .or above might be fragile if resolvedImages is empty; we guarded with condition.
        // If the combined or fails, fallback to two queries:
        let userPost = null;
        const userImageMap = {};

        if (!userRows) {
          // fallback queries
          const { data: singlePostRow } = await supabase
            .from("reactions")
            .select("reaction_type")
            .eq("user_id", user.id)
            .eq("post_id", recipeId)
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

          if (singlePostRow) userPost = singlePostRow.reaction_type;

          if (resolvedImages.length > 0) {
            const { data: userImgRows } = await supabase
              .from("reactions")
              .select("reaction_type,image_url")
              .eq("user_id", user.id)
              .in("image_url", resolvedImages);

            if (userImgRows) {
              userImgRows.forEach((r) => {
                userImageMap[r.image_url] = r.reaction_type;
              });
            }
          }
        } else {
          userRows.forEach((r) => {
            if (r.post_id === recipeId) userPost = r.reaction_type;
            if (r.image_url) userImageMap[r.image_url] = r.reaction_type;
          });
        }

        setUserPostReaction(userPost || null);
        setUserImageReactions(userImageMap);
      } else {
        // not logged in
        setUserPostReaction(null);
        setUserImageReactions({});
      }
    } catch (err) {
      console.error("Error loading reactions:", err);
      // don't set global error - reaction loading non-blocking
    }
  }

  // -------------------------
  // REACTIONS: MUTATIONS (post)
  // -------------------------
  async function handleReactPost(reactionType) {
    const user = await getCurrentUser();
    if (!user) {
      return alert("Anda harus login untuk bereaksi.");
    }

    try {
      // Check current reaction by this user for this post
      const { data: existing } = await supabase
        .from("reactions")
        .select("id,reaction_type")
        .eq("user_id", user.id)
        .eq("post_id", recipeId)
        .limit(1)
        .single()
        .catch(() => ({ data: null }));

      if (existing && existing.reaction_type === reactionType) {
        // same reaction -> remove
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;

        setUserPostReaction(null);
      } else if (existing) {
        // different reaction -> update
        const { error } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
        if (error) throw error;

        setUserPostReaction(reactionType);
      } else {
        // insert new
        const { error } = await supabase.from("reactions").insert({
          user_id: user.id,
          post_id: recipeId,
          reaction_type: reactionType,
        });
        if (error) throw error;

        setUserPostReaction(reactionType);
      }

      // Reload counts
      await loadReactions(images);
    } catch (err) {
      console.error("React post error:", err);
      alert(err?.message || "Gagal menambahkan reaksi");
    }
  }

  // -------------------------
  // REACTIONS: MUTATIONS (image)
  // -------------------------
  async function handleReactImage(imageUrl, reactionType) {
    const user = await getCurrentUser();
    if (!user) {
      return alert("Anda harus login untuk bereaksi.");
    }
    try {
      // Check existing
      const { data: existing } = await supabase
        .from("reactions")
        .select("id,reaction_type")
        .eq("user_id", user.id)
        .eq("image_url", imageUrl)
        .limit(1)
        .single()
        .catch(() => ({ data: null }));

      if (existing && existing.reaction_type === reactionType) {
        // remove
        const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
        if (error) throw error;
        setUserImageReactions((prev) => {
          const copy = { ...prev };
          delete copy[imageUrl];
          return copy;
        });
      } else if (existing) {
        // update
        const { error } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("id", existing.id);
        if (error) throw error;
        setUserImageReactions((prev) => ({ ...prev, [imageUrl]: reactionType }));
      } else {
        const { error } = await supabase.from("reactions").insert({
          user_id: user.id,
          image_url: imageUrl,
          reaction_type: reactionType,
        });
        if (error) throw error;
        setUserImageReactions((prev) => ({ ...prev, [imageUrl]: reactionType }));
      }

      // reload counts
      await loadReactions(images);
    } catch (err) {
      console.error("React image error:", err);
      alert(err?.message || "Gagal menambahkan reaksi pada gambar");
    }
  }

  // -------------------------
  // DELETE POST
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
  // LIGHTBOX CONTROLS
  // -------------------------
  const openLightboxAt = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

  // -------------------------
  // RENDERING
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-2 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Kembali
      </button>

      {/* Title + Reactions for post */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <p className="text-slate-500 mb-4">By {post.author || "Unknown"}</p>

          {/* Reaction buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {REACTIONS.map((r) => {
              const active = userPostReaction === r.key;
              const count = postCounts[r.key] || 0;
              return (
                <button
                  key={r.key}
                  onClick={() => handleReactPost(r.key)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"} hover:opacity-90 transition-colors`}
                >
                  <span className="text-sm">{r.emoji}</span>
                  <span className="text-sm hidden sm:inline">{r.label}</span>
                  <span className="text-xs text-slate-500 ml-1">× {count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorite / Edit / Delete actions */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <FavoriteButton isFavorited={isFavorited} onClick={() => setIsFavorited(!isFavorited)} />
            {onEdit && (
              <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, idx) => {
              const counts = imageCounts[src] || {};
              const userReaction = userImageReactions[src] || null;
              return (
                <div key={src} className="relative group">
                  <button
                    onClick={() => openLightboxAt(idx)}
                    className="overflow-hidden rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform w-full block"
                    aria-label={`Open image ${idx + 1}`}
                  >
                    <img src={src} alt={`Image ${idx + 1}`} className="w-full h-48 object-cover rounded-xl" />
                  </button>

                  {/* Reaction overlay */}
                  <div className="absolute left-2 bottom-2 flex gap-2">
                    {REACTIONS.slice(0, 3).map((r) => {
                      const active = userReaction === r.key;
                      const count = counts[r.key] || 0;
                      return (
                        <button
                          key={r.key}
                          onClick={() => handleReactImage(src, r.key)}
                          className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${active ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"} backdrop-blur border`}
                        >
                          <span className="leading-none">{r.emoji}</span>
                          <span className="ml-1">{count}</span>
                        </button>
                      );
                    })}

                    {/* show a compact summary of other reactions (if any) */}
                    {Object.keys(counts).length > 3 && (
                      <div className="ml-1 px-2 py-1 rounded-full bg-white/90 text-xs border">
                        +{Object.values(counts).reduce((a, b) => a + b, 0) - (counts[REACTIONS[0].key] || 0) - (counts[REACTIONS[1].key] || 0) - (counts[REACTIONS[2].key] || 0)}
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

      {/* Content */}
      <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed mt-8">
        {post.content && <div dangerouslySetInnerHTML={{ __html: post.content }} className="whitespace-pre-wrap" />}
      </div>

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

      {/* Lightbox */}
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
