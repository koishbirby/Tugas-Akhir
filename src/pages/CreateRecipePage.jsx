// src/pages/CreateRecipePage.jsx - Blog Post Creator
import { useState, useEffect } from 'react';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Save } from 'lucide-react';
import blogPostService from '../services/blogPostService';
import { saveDraft, loadDraft, deleteDraft, hasDraft, getDraftTimestamp, formatDraftTime } from '../Utils/draftStorage';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function CreateRecipePage({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
  });
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft('create')) {
      const timestamp = getDraftTimestamp('create');
      setDraftTimestamp(timestamp);
      setShowDraftModal(true);
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const interval = setInterval(() => {
      handleSaveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [formData, autoSaveEnabled]);

  // Load draft
  const handleLoadDraft = () => {
    const draft = loadDraft('create');
    if (draft) {
      setFormData(draft.formData || formData);
      setShowDraftModal(false);
      alert('Draft berhasil dimuat!');
    }
  };

  // Discard draft
  const handleDiscardDraft = () => {
    deleteDraft('create');
    setShowDraftModal(false);
    setDraftTimestamp(null);
  };

  // Save draft manually
  const handleSaveDraft = () => {
    const draftData = {
      formData,
      // do not persist files in draft to keep storage simple
    };
    
    const success = saveDraft(draftData, 'create');
    if (success) {
      const timestamp = getDraftTimestamp('create');
      setDraftTimestamp(timestamp);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection (max 3)
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      alert('Maximum 3 images allowed');
      files.splice(3);
    }
    setImagesFiles(files);

    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Judul blog wajib diisi');
      return false;
    }

    if (formData.title.trim().length < 3) {
      setError('Judul minimal 3 karakter');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Konten blog wajib diisi');
      return false;
    }

    if (formData.content.trim().length < 10) {
      setError('Konten minimal 10 karakter');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare blog post data
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || null,
        author: formData.author.trim() || null,
        category: formData.category,
        images: imagesFiles,
      };

      // Create blog post
      const result = await blogPostService.createBlogPost(postData);

      if (result.success) {
        alert('Blog post berhasil dibuat!');
        deleteDraft('create'); // Clear draft after successful creation
        if (onSuccess) {
          onSuccess(result.data);
        } else if (onBack) {
          onBack();
        }
      } else {
        throw new Error(result.error || 'Gagal membuat blog post');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat membuat blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      {/* Draft Modal */}
      <ConfirmModal
        isOpen={showDraftModal}
        onClose={handleDiscardDraft}
        onConfirm={handleLoadDraft}
        title="Draft Ditemukan"
        message={`Anda memiliki draft yang disimpan ${draftTimestamp ? formatDraftTime(draftTimestamp) : ''}. Apakah Anda ingin melanjutkan draft tersebut?`}
        confirmText="Muat Draft"
        cancelText="Mulai Baru"
        variant="info"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>

          {/* Draft Info & Save Button */}
          <div className="flex items-center gap-3">
            {draftTimestamp && (
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                <Save className="w-4 h-4" />
                <span>Tersimpan {formatDraftTime(draftTimestamp)}</span>
              </div>
            )}
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Simpan draft"
            >
              <Save className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Simpan Draft</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Buat Blog Post Baru</h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600">Bagikan ceritamu dengan dunia</p>
            {autoSaveEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Auto-save aktif</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Judul Blog <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul yang menarik..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
              <p className="text-xs text-slate-500 mt-1">{formData.title.length} karakter</p>
            </div>

            {/* Author & Category */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Penulis
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Nama Anda"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">...</option>
                  <option value="makanan">Myth</option>
                  <option value="minuman">Cursed Object</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ringkasan Singkat (Excerpt)
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Ringkasan singkat blog post (opsional)..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.excerpt.length} karakter</p>
            </div>

            {/* Images (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gambar (maks 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="mb-3"
              />

              {imagePreviews && imagePreviews.length > 0 && (
                <div className="flex gap-3 overflow-x-auto py-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="w-40 h-28 rounded-xl overflow-hidden border border-white/40 shadow-sm">
                      <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konten Blog <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Tulis konten blog Anda di sini..."
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1">{formData.content.length} karakter</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Publikasikan Blog
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}