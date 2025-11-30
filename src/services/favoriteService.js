// src/services/favoriteService.js
import { supabase } from '../config/supabaseClient';

class FavoriteService {
  /**
   * Get all favorite posts for a user with post details
   * @param {string} userIdentifier - User identifier
   * @returns {Promise<{success: boolean, data: Array, message: string, error?: any}>}
   */
  async getFavorites(userIdentifier) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          post_id,
          user_identifier,
          created_at,
          post:blog_posts(
            id,
            title,
            excerpt,
            author,
            category,
            created_at
          )
        `)
        .eq('user_identifier', userIdentifier)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Favorites fetched successfully',
      };
    } catch (err) {
      return {
        success: false,
        data: [],
        message: err.message || 'Failed to fetch favorites',
        error: err,
      };
    }
  }

  /**
   * Toggle favorite (add/remove) for a user
   * @param {Object} params
   * @param {string} params.post_id - ID of the post to favorite
   * @param {string} params.user_identifier - User identifier
   * @returns {Promise<{success: boolean, data: Object, message: string, error?: any}>}
   */
  async toggleFavorite({ post_id, user_identifier }) {
    try {
      // Check if favorite already exists
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_identifier', user_identifier)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);

        if (deleteError) throw deleteError;

        return {
          success: true,
          data: { favorited: false, post_id },
          message: 'Favorite removed',
        };
      } else {
        // Add favorite
        const { data: newFavorite, error: insertError } = await supabase
          .from('favorites')
          .insert([{ post_id, user_identifier }])
          .select(`
            id,
            post_id,
            user_identifier,
            created_at,
            post:blog_posts(
              id,
              title,
              excerpt,
              author,
              category,
              created_at
            )
          `);

        if (insertError) throw insertError;

        return {
          success: true,
          data: { favorited: true, ...newFavorite[0] },
          message: 'Favorite added',
        };
      }
    } catch (err) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to toggle favorite',
        error: err,
      };
    }
  }

  /**
   * Check if a post is favorited by a user
   * @param {string} post_id - Post ID
   * @param {string} userIdentifier - User identifier
   * @returns {Promise<{success: boolean, favorited: boolean, error?: any}>}
   */
  async isFavorited(post_id, userIdentifier) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_identifier', userIdentifier)
        .maybeSingle();

      if (error) throw error;

      return {
        success: true,
        favorited: !!data,
      };
    } catch (err) {
      return {
        success: false,
        favorited: false,
        error: err,
      };
    }
  }
}

export default new FavoriteService();
