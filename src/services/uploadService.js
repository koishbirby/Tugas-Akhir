import { supabase } from '../config/supabaseClient';

class UploadService {
  /**
   * Upload recipe image to Supabase Storage
   * 
   * SETUP REQUIRED:
   * 1. Create a 'recipe-images' bucket in Supabase Storage (set to public policy)
   * 2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file
   * 
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} - { success: true, data: { url }, error: null } or { success: false, error, data: null }
   */
  async uploadImage(file) {
    try {
      // Validation
      if (!file) {
        return { success: false, error: 'No file provided', data: null };
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Allowed: .jpg, .jpeg, .png, .webp',
          data: null
        };
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return { success: false, error: 'File size exceeds 5MB limit', data: null };
      }

      // Check if supabase client is initialized
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized. Check your .env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)',
          data: null
        };
      }

      // Generate unique file name to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('recipe-images')   // Bucket name - MUST exist in Supabase
        .upload(filePath, file);

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}. Make sure 'recipe-images' bucket exists and is public.`,
          data: null
        };
      }

      // Generate public URL
      const { data: publicUrlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        return {
          success: false,
          error: 'Failed to generate public URL for uploaded image',
          data: null
        };
      }

      return {
        success: true,
        data: { url: publicUrlData.publicUrl },
        error: null
      };

    } catch (error) {
      console.error('Upload service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during upload',
        data: null
      };
    }
  }
}

export default new UploadService();
