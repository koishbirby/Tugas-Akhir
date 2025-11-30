import { supabase } from '../config/supabaseClient';

class RecipeService {
  /**
   * Get all recipes from Supabase with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search in name/description
   * @param {string} params.sort_by - Sort by field (default: 'created_at')
   * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise<Object>} - { success, data, pagination, message, error }
   */
  async getRecipes(params = {}) {
    try {
      const { category, search, page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = params;
      
      if (!supabase) {
        return {
          success: false,
          data: null,
          pagination: null,
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      let query = supabase.from('recipes').select('*', { count: 'exact' });

      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply sorting
      query = query.order(sort_by, { ascending: order === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase fetch error:', error);
        return {
          success: false,
          data: null,
          pagination: null,
          message: `Failed to fetch recipes: ${error.message}`,
          error: `Failed to fetch recipes: ${error.message}`
        };
      }

      // Calculate pagination
      const total_pages = Math.ceil((count || 0) / limit);
      const pagination = {
        page,
        limit,
        total: count || 0,
        total_pages
      };

      return {
        success: true,
        data: data || [],
        pagination,
        message: null,
        error: null
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        data: null,
        pagination: null,
        message: error?.message || 'Failed to fetch recipes',
        error: error?.message || 'An error occurred while fetching recipes'
      };
    }
  }

  /**
   * Get recipe by ID
   * @param {string} id - Recipe ID
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async getRecipeById(id) {
    try {
      if (!supabase) {
        return { 
          success: false, 
          data: null, 
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase fetch error:', error);
        return {
          success: false,
          data: null,
          message: `Failed to fetch recipe: ${error.message}`,
          error: `Failed to fetch recipe: ${error.message}`
        };
      }

      return { 
        success: true, 
        data, 
        message: null,
        error: null 
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to fetch recipe',
        error: error?.message || 'An error occurred while fetching the recipe'
      };
    }
  }

  /**
   * Create new recipe
   * @param {Object} recipeData - Recipe data
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async createRecipe(recipeData) {
    try {
      if (!supabase) {
        return { 
          success: false, 
          data: null, 
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return {
          success: false,
          data: null,
          message: `Failed to create recipe: ${error.message}`,
          error: `Failed to create recipe: ${error.message}`
        };
      }

      return { 
        success: true, 
        data, 
        message: null,
        error: null 
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to create recipe',
        error: error?.message || 'An error occurred while creating the recipe'
      };
    }
  }

  /**
   * Update existing recipe
   * @param {string} id - Recipe ID
   * @param {Object} recipeData - Recipe data
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async updateRecipe(id, recipeData) {
    try {
      if (!supabase) {
        return { 
          success: false, 
          data: null, 
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      const { data, error } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return {
          success: false,
          data: null,
          message: `Failed to update recipe: ${error.message}`,
          error: `Failed to update recipe: ${error.message}`
        };
      }

      return { 
        success: true, 
        data, 
        message: null,
        error: null 
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to update recipe',
        error: error?.message || 'An error occurred while updating the recipe'
      };
    }
  }

  /**
   * Partially update recipe
   * @param {string} id - Recipe ID
   * @param {Object} partialData - Partial recipe data
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async patchRecipe(id, partialData) {
    try {
      if (!supabase) {
        return { 
          success: false, 
          data: null, 
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      const { data, error } = await supabase
        .from('recipes')
        .update(partialData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return {
          success: false,
          data: null,
          message: `Failed to update recipe: ${error.message}`,
          error: `Failed to update recipe: ${error.message}`
        };
      }

      return { 
        success: true, 
        data, 
        message: null,
        error: null 
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to update recipe',
        error: error?.message || 'An error occurred while updating the recipe'
      };
    }
  }

  /**
   * Delete recipe
   * @param {string} id - Recipe ID
   * @returns {Promise<Object>} - { success, message, error }
   */
  async deleteRecipe(id) {
    try {
      if (!supabase) {
        return { 
          success: false, 
          message: 'Supabase client not initialized',
          error: 'Supabase client not initialized'
        };
      }

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          message: `Failed to delete recipe: ${error.message}`,
          error: `Failed to delete recipe: ${error.message}`
        };
      }

      return { 
        success: true, 
        message: null,
        error: null 
      };
    } catch (error) {
      console.error('Recipe service error:', error);
      return {
        success: false,
        message: error?.message || 'Failed to delete recipe',
        error: error?.message || 'An error occurred while deleting the recipe'
      };
    }
  }
}

export default new RecipeService();