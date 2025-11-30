// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Heart, Trash2, Loader } from 'lucide-react';
import userService from '../services/userService';

export default function ProfilePage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userIdentifier = userService.getUserIdentifier();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all favorite posts for this user with post details
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          id,
          post_id,
          created_at,
          post:blog_posts(id, title, excerpt, author, category, created_at)
        `)
        .eq('user_identifier', userIdentifier)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err.message || 'Gagal memuat post favorit');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (deleteError) throw deleteError;
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      alert('Gagal menghapus post favorit: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Profile Pengguna
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Pengguna</h2>
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">ID Pengguna:</span> {userIdentifier}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Total Post Favorit:</span> {favorites.length}
          </p>
        </div>

        {/* Liked Posts Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
            Post Favorit Saya
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Belum ada post favorit. Mulai sukai beberapa post!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                      {favorite.post?.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {favorite.post?.excerpt || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {favorite.post?.author && (
                        <span>By {favorite.post.author}</span>
                      )}
                      {favorite.post?.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {favorite.post.category}
                        </span>
                      )}
                      <span>
                        Disukai pada {new Date(favorite.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}