import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Loader } from 'lucide-react';

export default function EditRecipePage({ recipeId, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!recipeId) return;

    const loadRecipe = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts') // adjust table name if needed
          .select('title, content')
          .eq('id', recipeId)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.title || '');
          setContent(data.content || '');
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat resep');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || title.trim().length < 3) {
      setError('Judul wajib diisi (minimal 3 karakter)');
      return;
    }

    setSaving(true);
    try {
      const updates = { title: title.trim(), content };

      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', recipeId);

      if (error) throw error;

      // call onBack instead of navigate
      if (onBack) onBack();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Resep</h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}

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
            placeholder="Judul resep"
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
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
