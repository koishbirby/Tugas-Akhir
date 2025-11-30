import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { Loader, X, Plus } from 'lucide-react';

export default function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'mudah',
    is_featured: false,
  });

  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState(['']);

  useEffect(() => {
    if (!id) return;

    const loadRecipe = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            prep_time: data.prep_time || 0,
            cook_time: data.cook_time || 0,
            servings: data.servings || 1,
            difficulty: data.difficulty || 'mudah',
            is_featured: data.is_featured || false,
          });

          setIngredients(data.ingredients || [{ name: '', quantity: '' }]);
          setSteps(data.steps || ['']);
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat resep');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '' }]);
  const removeIngredient = (index) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.title.trim().length < 3) {
      setError('Judul wajib diisi (minimal 3 karakter)');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        ...formData,
        ingredients,
        steps,
      };

      const { error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      navigate(-1);
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
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Judul</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl"
            placeholder="Judul resep"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border rounded-xl resize-none"
            placeholder="Ceritakan tentang resep ini..."
          />
        </div>

        {/* Prep/Cook Time & Servings */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Waktu Persiapan (menit)
            </label>
            <input
              type="number"
              name="prep_time"
              value={formData.prep_time}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Waktu Memasak (menit)
            </label>
            <input
              type="number"
              name="cook_time"
              value={formData.cook_time}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Porsi</label>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 border rounded-xl"
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tingkat Kesulitan</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Bahan-bahan</label>
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Nama bahan"
                  className="flex-1 px-4 py-3 border rounded-xl"
                />
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  placeholder="Jumlah"
                  className="w-32 px-4 py-3 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="w-full py-3 border-2 border-dashed rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Tambah Bahan
            </button>
          </div>
        </div>

        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Langkah-langkah</label>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <textarea
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  rows={2}
                  className="flex-1 px-4 py-3 border rounded-xl resize-none"
                  placeholder="Tulis langkah..."
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={steps.length === 1}
                  className="p-3 text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="w-full py-3 border-2 border-dashed rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Tambah Langkah
            </button>
          </div>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl">
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label className="text-sm text-slate-700 cursor-pointer">
            Tandai sebagai resep unggulan
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="flex-1 px-6 py-3 border rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
