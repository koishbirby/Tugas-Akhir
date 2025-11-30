import { supabase } from '../config/supabaseClient';

class UploadService {
  /**
   * Create a blog post in Supabase database
   * 
   * SETUP REQUIRED:
   * 1. Create a 'blog_posts' table in Supabase with columns:
   *    - id (bigint, primary key, auto-generated)
   *    - title (varchar)
   *    - content (text)
   *    - excerpt (text, optional)
   *    - author (varchar, optional)
   *    - category (varchar, optional)
   *    - created_at (timestamp, default now())
   *    - updated_at (timestamp, default now())
   * 2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file
   * 
   * @param {Object} postData - Blog post data { title, content, excerpt, author, category }
   * @returns {Promise<Object>} - { success: true, data: { id, ...post }, error: null } or { success: false, error, data: null }
   */
  async uploadImage(postData) {
    try {
      // Validation
      if (!postData) {
        return { success: false, error: 'No post data provided', data: null };
      }

      if (!postData.title || postData.title.trim() === '') {
        return {
          success: false,
          error: 'Post title is required',
          data: null
        };
      }

      if (!postData.content || postData.content.trim() === '') {
        return {
          success: false,
          error: 'Post content is required',
          data: null
        };
      }

      // Check if supabase client is initialized
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized. Check your .env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)',
          data: null
        };
      }

      // Prepare blog post data
      const blogPost = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        excerpt: postData.excerpt?.trim() || null,
        author: postData.author?.trim() || null,
        category: postData.category?.trim() || null
      };

      // Insert into Supabase database
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogPost])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return {
          success: false,
          error: `Failed to save post: ${error.message}. Make sure 'blog_posts' table exists in Supabase.`,
          data: null
        };
      }

      return {
        success: true,
        data: data,
        error: null
      };

    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred while saving the post',
        data: null
      };
    }
  }

  /**
   * Get all blog posts from Supabase
   * @returns {Promise<Object>} - { success: true, data: [...posts], error: null } or { success: false, error, data: null }
   */
  async getPosts() {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          data: null
        };
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return {
          success: false,
          error: error.message,
          data: null
        };
      }

      return {
        success: true,
        data: data,
        error: null
      };

    } catch (error) {
      console.error('Fetch service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred while fetching posts',
        data: null
      };
    }
  }

  /**
   * Get a single blog post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Object>} - { success: true, data: {...post}, error: null } or { success: false, error, data: null }
   */
  async getPostById(id) {
    try {
      if (!id) {
        return { success: false, error: 'Post ID is required', data: null };
      }

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          data: null
        };
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
          error: error.message,
          data: null
        };
      }

      return {
        success: true,
        data: data,
        error: null
      };

    } catch (error) {
      console.error('Fetch service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        data: null
      };
    }
  }

  /**
   * Update a blog post
   * @param {number} id - Post ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - { success: true, data: {...post}, error: null } or { success: false, error, data: null }
   */
  async updatePost(id, updates) {
    try {
      if (!id) {
        return { success: false, error: 'Post ID is required', data: null };
      }

      if (!updates || Object.keys(updates).length === 0) {
        return { success: false, error: 'No updates provided', data: null };
      }

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          data: null
        };
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
          error: error.message,
          data: null
        };
      }

      return {
        success: true,
        data: data,
        error: null
      };

    } catch (error) {
      console.error('Update service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        data: null
      };
    }
  }

  /**
   * Delete a blog post
   * @param {number} id - Post ID
   * @returns {Promise<Object>} - { success: true, error: null } or { success: false, error, data: null }
   */
  async deletePost(id) {
    try {
      if (!id) {
        return { success: false, error: 'Post ID is required', data: null };
      }

      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized',
          data: null
        };
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: error.message,
          data: null
        };
      }

      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('Delete service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        data: null
      };
    }
  }
}

export default new UploadService();
