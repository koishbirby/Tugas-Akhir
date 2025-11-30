import { supabase } from '../config/supabaseClient';

class BlogPostService {

  /**
   * Fetch all blog posts
   */
  async getBlogPosts(params = {}) {
    try {
      const { category, search, page = 1, limit = 12 } = params;

      let query = supabase
        .from('blog_posts')
        .select('id, title, content, excerpt, author, category, created_at', {
          count: 'exact'
        });

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,content.ilike.%${search}%`
        );
      }

      query = query.order('created_at', { ascending: false });

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: error.message,
          data: null,
          pagination: null
        };
      }

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        error: null
      };

    } catch (err) {
      return {
        success: false,
        error: err.message,
        data: null,
        pagination: null
      };
    }
  }



  /**
   * Fetch single post by ID
   */
  async getBlogPostById(id) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, content, excerpt, author, category, created_at')
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, data, error: null };

    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  }



  /**
   * Create a blog post
   */
  async createBlogPost(postData) {
    try {
      // Prepare blog post data
      const blogPost = {
        title: postData.title?.trim(),
        content: postData.content?.trim(),
        excerpt: postData.excerpt?.trim() || null,
        author: postData.author?.trim() || null,
        category: postData.category?.trim() || null,
        images: null
      };

      // If images (File objects) provided, upload them to Supabase storage
      if (postData.images && Array.isArray(postData.images) && postData.images.length > 0) {
        const uploadedUrls = [];
        // limit to max 3 images
        const files = postData.images.slice(0, 3);

        for (const file of files) {
          try {
            const ext = (file.name || '').split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
            const path = `${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('blog_images')
              .upload(path, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
              console.warn('Image upload failed for', file.name, uploadError.message);
              continue;
            }

            const { data: publicData } = supabase.storage.from('blog_images').getPublicUrl(path);
            if (publicData && publicData.publicUrl) {
              uploadedUrls.push(publicData.publicUrl);
            }
          } catch (imgErr) {
            console.warn('Image upload exception:', imgErr?.message || imgErr);
          }
        }

        if (uploadedUrls.length > 0) {
          blogPost.images = uploadedUrls;
        }
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogPost])
        .select('id, title, content, excerpt, author, category, images, created_at')
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, data, error: null };

    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  }



  /**
   * Update blog post
   */
  async updateBlogPost(id, updates) {
    try {
      const blogPostUpdates = {
        title: updates.title?.trim(),
        content: updates.content?.trim(),
        excerpt: updates.excerpt?.trim() || null,
        author: updates.author?.trim() || null,
        category: updates.category?.trim() || null
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .update(blogPostUpdates)
        .eq('id', id)
        .select('id, title, content, excerpt, author, category, created_at')
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, data, error: null };

    } catch (err) {
      return { success: false, error: err.message, data: null };
    }
  }



  /**
   * Delete blog post
   */
  async deleteBlogPost(id) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };

    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default new BlogPostService();
