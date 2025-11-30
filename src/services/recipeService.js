import { apiClient } from '../config/api';

class RecipeService {
  /**
   * Get all recipes with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
   * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
   * @param {string} params.search - Search in name/description
   * @param {string} params.sort_by - Sort by field (default: 'created_at')
   * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise<Object>} - { success, data, pagination, message, error }
   */
  async getRecipes(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/recipes', { params });
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
      return {
        success: true,
        data: response.data || response,
        pagination: response.pagination || null,
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
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
      return {
        success: true,
        data: response.data || response,
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
      const response = await apiClient.post('/api/v1/recipes', recipeData);
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
      return {
        success: true,
        data: response.data || response,
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
   * Update existing recipe (full replacement)
   * @param {string} id - Recipe ID
   * @param {Object} recipeData - Complete recipe data (all fields required)
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async updateRecipe(id, recipeData) {
    try {
      const response = await apiClient.put(`/api/v1/recipes/${id}`, recipeData);
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
      return {
        success: true,
        data: response.data || response,
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
   * Partially update recipe (only send fields to update)
   * @param {string} id - Recipe ID
   * @param {Object} partialData - Partial recipe data (only fields to update)
   * @returns {Promise<Object>} - { success, data, message, error }
   */
  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
      return {
        success: true,
        data: response.data || response,
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
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);
      
      // If apiClient returns data directly due to response interceptor
      if (response.success !== undefined) {
        return response;
      }
      
      // Wrap successful response
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