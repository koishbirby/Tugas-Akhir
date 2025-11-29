// src/services/UploadService.js
import { supabase } from '../lib/supabaseClient';

class UploadService {
  /**
   * Upload image to Supabase Storage
   * @param {File} file - Image file to upload
   * @param {string} folder - Folder in storage bucket
   * @returns {Promise<string>} - Public URL of uploaded image
   */
  async uploadImage(file, folder = 'reports') {
    if (!file) throw new Error('No file provided');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: .jpg, .jpeg, .png, .webp');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) throw new Error('File size exceeds 5MB');

    // Generate a unique filename
    const fileName = `${folder}/${Date.now()}_${file.name}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('your-bucket-name') // <-- replace with your bucket
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { publicUrl, error: urlError } = supabase.storage
      .from('your-bucket-name')
      .getPublicUrl(fileName);

    if (urlError) throw urlError;

    return publicUrl;
  }
}

export default new UploadService();
