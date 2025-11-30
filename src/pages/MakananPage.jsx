// src/pages/MakananPage.jsx
import { useState } from "react";
import { useBlogPosts } from "../hooks/useBlogPosts";
import RecipeGrid from "../components/makanan/RecipeGrid";
import AdvancedFilter from "../components/common/AdvancedFilter.jsx";
import { mapBlogPostsToRecipes } from "../Utils/blogToRecipeMapper.js";

export default function MakananPage({ onRecipeClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "",
    sortBy: "created_at",
    order: "desc",
    prepTimeMax: "",
  });
  const [page, setPage] = useState(1);

  // Fetch blog posts from Supabase with all filters
  const { posts, loading, error, pagination, refetch } = useBlogPosts({
    category: "makanan",
    search: searchQuery || undefined,
    page,
    limit: 12,
  });

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  // Client-side filter for prep time (since API might not support it)
  const filteredRecipes = filters.prepTimeMax
    ? posts.filter(
        (post) => post.prep_time <= parseInt(filters.prepTimeMax)
      )
    : posts;

  // Map blog posts to recipe shape for RecipeGrid
  const recipesForGrid = mapBlogPostsToRecipes(filteredRecipes);

  // Collect images from posts to show banner above grid
  const bannerImages = [];
  if (posts && posts.length > 0) {
    for (const p of posts) {
      if (p.images && Array.isArray(p.images) && p.images.length > 0) {
        for (const url of p.images) {
          if (!bannerImages.includes(url)) bannerImages.push(url);
          if (bannerImages.length >= 6) break;
        }
      }
      if (bannerImages.length >= 6) break;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-800/80 to-purple-600/70 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Advanced Filter */}
        <AdvancedFilter
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          initialFilters={{ ...filters, search: searchQuery }}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat resep...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">
                Terjadi Kesalahan
              </p>
              <p className="text-red-500">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && (
          <>
            {/* Images banner (if any) */}
            {bannerImages.length > 0 && (
              <div className="mb-8">
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {bannerImages.map((src, idx) => (
                    <div key={idx} className="w-64 h-40 flex-shrink-0 rounded-xl overflow-hidden border border-white/30 shadow-sm">
                      <img src={src} alt={`banner-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Nothing is found.
                </p>
                <p className="text-gray-500 mt-2">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            ) : (
              <RecipeGrid
                recipes={recipesForGrid}
                onRecipeClick={onRecipeClick}
              />
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  ← Sebelumnya
                </button>

                <div className="flex flex-col md:flex-row items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-xl border border-white/40">
                  <span className="text-slate-700 font-semibold">
                    Halaman {pagination.page} dari {pagination.total_pages}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({pagination.total} resep)
                  </span>
                </div>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.total_pages}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
