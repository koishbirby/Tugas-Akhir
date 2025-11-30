import { supabase } from '../config/supabaseClient';

class BlogPostService {
  /**
   * Get all blog posts from Supabase
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search in title/content
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 12)
   * @returns {Promise<Object>} - { success, data, pagination, error }
   */
  async getBlogPosts(params = {}) {
    try {
      const { category, search, page = 1, limit = 12 } = params;
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          data: null,
          pagination: null
        };
      }

      let query = supabase.from('blog_posts').select('*', { count: 'exact' });

      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,content.ilike.%${search}%`
        );
      }

      // Apply sorting
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase fetch error:', error);
        return {
          success: false,
          error: `Failed to fetch blog posts: ${error.message}`,
          data: null,
          pagination: null
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
        error: null
      };
    } catch (error) {
      console.error('Blog post service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while fetching blog posts',
        data: null,
        pagination: null
      };
    }
  }

  /**
   * Get single blog post by ID
   * @param {string} id - Blog post ID
   * @returns {Promise<Object>} - { success, data, error }
   */
  async getBlogPostById(id) {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized', data: null };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase fetch error:', error);
        return {
          success: false,
          error: `Failed to fetch blog post: ${error.message}`,
          data: null
        };
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error('Blog post service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while fetching the blog post',
        data: null
      };
    }
  }

  /**
   * Create blog post
   * @param {Object} postData - Blog post data
   * @returns {Promise<Object>} - { success, data, error }
   */
  async createBlogPost(postData) {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized', data: null };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return {
          success: false,
          error: `Failed to create blog post: ${error.message}`,
          data: null
        };
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error('Blog post service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while creating the blog post',
        data: null
      };
    }
  }

  /**
   * Update blog post
   * @param {string} id - Blog post ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - { success, data, error }
   */
  async updateBlogPost(id, updates) {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized', data: null };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return {
          success: false,
          error: `Failed to update blog post: ${error.message}`,
          data: null
        };
      }

      return { success: true, data, error: null };
    } catch (error) {
      console.error('Blog post service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while updating the blog post',
        data: null
      };
    }
  }

  /**
   * Delete blog post
   * @param {string} id - Blog post ID
   * @returns {Promise<Object>} - { success, error }
   */
  async deleteBlogPost(id) {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: `Failed to delete blog post: ${error.message}`
        };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Blog post service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while deleting the blog post'
      };
    }
  }
}

export default new BlogPostService();
