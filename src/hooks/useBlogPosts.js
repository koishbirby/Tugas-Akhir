import { useState, useEffect, useCallback } from 'react';
import blogPostService from '../services/blogPostService';

/**
 * Custom hook for fetching blog posts
 * @param {Object} params - Query parameters
 * @returns {Object} - { posts, loading, error, pagination, refetch }
 */
export function useBlogPosts(params = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogPostService.getBlogPosts(params);
      
      if (response.success) {
        setPosts(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.error || 'Failed to fetch blog posts');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchPosts,
  };
}

/**
 * Custom hook for fetching a single blog post
 * @param {string} id - Blog post ID
 * @returns {Object} - { post, loading, error, refetch }
 */
export function useBlogPost(id) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await blogPostService.getBlogPostById(id);
      
      if (response.success) {
        setPost(response.data);
      } else {
        setError(response.error || 'Failed to fetch blog post');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the blog post');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}
