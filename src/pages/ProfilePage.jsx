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
    <div className="p-4 md:p-8 pb-20 md:pb-8 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Profile Pengguna
        </h1>

        {/* User Info */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Informasi Pengguna</h2>
          <p className="mb-2">
            <span className="font-semibold">ID Pengguna:</span> {userIdentifier}
          </p>
          <p>
            <span className="font-semibold">Total Post Favorit:</span> {favorites.length}
          </p>
        </div>

        {/* Liked Posts Section */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
            Post Favorit Saya
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-800 border border-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p>Belum ada post favorit. Mulai sukai beberapa post!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 truncate">
                      {favorite.post?.title || 'Untitled'}
                    </h3>
                    <p className="text-sm mb-2 line-clamp-2">
                      {favorite.post?.excerpt || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {favorite.post?.author && (
                        <span>By {favorite.post.author}</span>
                      )}
                      {favorite.post?.category && (
                        <span className="px-2 py-1 bg-purple-900 text-purple-400 rounded">
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
                    className="flex items-center gap-2 px-3 py-2 bg-red-800 text-red-400 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
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
