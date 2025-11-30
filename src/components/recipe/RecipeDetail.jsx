// src/components/blog/BlogPostDetail.jsx
import { useState } from "react";
import { useBlogPosts } from "../../hooks/useBlogPosts";
import { useIsFavorited, getUserIdentifier } from "../../hooks/useFavorites";
import userService from "../../services/userService";
import FavoriteButton from "../common/FavoriteButton";

export default function BlogPostDetail({ postId, onBack }) {
  const { post, loading, error } = useBlogPosts(postId);
  const { isFavorited, toggleFavorite } = useIsFavorited(postId);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Memuat post...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-red-600 mb-2">Terjadi Kesalahan</p>
      <p className="mb-4">{error}</p>
      <button onClick={onBack} className="px-4 py-2 bg-red-600 text-white rounded-lg">Kembali</button>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Post tidak ditemukan</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

      {/* Author */}
      <p className="text-gray-500 mb-4">By {post.author || "Unknown"}</p>

      {/* Images (if any) */}
      {post.images?.length > 0 && (
        <div className="mb-6 space-y-4">
          {post.images.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Blog image ${index + 1}`}
              className="rounded-xl"
            />
          ))}
        </div>
      )}

      {/* Blog Content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Favorite button */}
      <div className="mt-6">
        <FavoriteButton
          isFavorited={isFavorited}
          onClick={toggleFavorite}
        />
      </div>
    </div>
  );
}
