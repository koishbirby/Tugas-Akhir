// src/components/edit/EditRecipePage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import { Loader } from "lucide-react";

export default function EditRecipePage({ postId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  // Load post data
  useEffect(() => {
    if (!postId) return;

    const loadPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("title, content, author")
          .eq("id", postId)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
          setAuthor(data.author || "");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Save changes
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || title.trim().length < 3) {
      setError("Judul wajib diisi (minimal 3 karakter)");
      return;
    }

    setSaving(true);
    try {
      const updates = { title: title.trim(), content, author: author.trim() || null };

      const { error } = await supabase
        .from("blog_posts")
        .update(updates)
        .eq("id", postId);

      if (error) throw error;

      if (onBack) onBack(); // Go back to RecipeDetail
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Judul
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Judul post"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Penulis
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            placeholder="Nama penulis"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Konten
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 border rounded-lg resize-vertical"
            placeholder="Tulis konten di sini..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="px-4 py-2 border rounded-md"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
