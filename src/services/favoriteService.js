import { supabase } from '../config/supabaseClient';

class FavoriteService {
  /**
   * Get all favorite posts by user identifier
   * @param {string} userIdentifier - User identifier
   * @returns {Promise}
   */
  async getFavorites(userIdentifier) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, post_id, user_identifier, created_at')
        .eq('user_identifier', userIdentifier);

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Favorites fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch favorites',
        error,
      };
    }
  }

  /**
   * Toggle favorite (add if not exists, remove if exists)
   * @param {Object} data - Favorite data
   * @param {string} data.post_id - Post ID (or recipe_id for compatibility)
   * @param {string} data.user_identifier - User identifier
   * @returns {Promise}
   */
  async toggleFavorite(data) {
    try {
      const postId = data.post_id || data.recipe_id;
      const { user_identifier } = data;

      // Check if favorite already exists
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', postId)
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
          data: { favorited: false },
          message: 'Favorite removed',
        };
      } else {
        // Add favorite
        const { data: newFavorite, error: insertError } = await supabase
          .from('favorites')
          .insert([
            {
              post_id: postId,
              user_identifier,
            },
          ])
          .select('id, post_id, user_identifier, created_at');

        if (insertError) throw insertError;

        return {
          success: true,
          data: { favorited: true, ...newFavorite?.[0] },
          message: 'Favorite added',
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to toggle favorite',
        error,
      };
    }
  }

  /**
   * Check if a post is favorited by user
   * @param {string} postId - Post ID
   * @param {string} userIdentifier - User identifier
   * @returns {Promise}
   */
  async isFavorited(postId, userIdentifier) {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', postId)
        .eq('user_identifier', userIdentifier)
        .maybeSingle();

      if (error) throw error;

      return {
        success: true,
        data: { isFavorited: !!data },
      };
    } catch (error) {
      return {
        success: false,
        data: { isFavorited: false },
        message: error.message || 'Failed to check favorite status',
        error,
      };
    }
  }
}

export default new FavoriteService();