import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';

/**
 * Service to handle image uploads and removals via Cloudinary using memory buffers.
 */
export const uploadService = {
  /**
   * Upload a single buffer to Cloudinary using upload_stream
   *
   * @param {Buffer} buffer - File buffer from Multer
   * @param {string} folder - Target folder in Cloudinary
   * @returns {Promise<{ url: string, publicId: string, format: string }>}
   */
  async uploadImageBuffer(buffer, folder = 'findit/items') {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (!isCloudinaryConfigured()) {
      console.warn('[Cloudinary] Cloudinary credentials not configured. Using data URI fallback.');
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
      const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45;
      const format = isPng ? 'png' : isWebp ? 'webp' : 'jpeg';
      return {
        url: `data:image/${format};base64,${buffer.toString('base64')}`,
        publicId: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        format
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // optimize maximum dimensions
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.warn(`[Cloudinary] Remote upload failed (${error.message}, HTTP ${error.http_code || 500}). Falling back to Data URI so reporting never fails.`);
            const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
            const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45;
            const format = isPng ? 'png' : isWebp ? 'webp' : 'jpeg';
            return resolve({
              url: `data:image/${format};base64,${buffer.toString('base64')}`,
              publicId: `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              format
            });
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format
          });
        }
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Upload multiple file buffers in parallel
   *
   * @param {Array<Express.Multer.File>} files
   * @param {string} folder
   * @returns {Promise<Array<{ url: string, publicId: string, format: string }>>}
   */
  async uploadMultipleImages(files = [], folder = 'findit/items') {
    if (!files || files.length === 0) {
      return [];
    }

    if (files.length > 5) {
      throw ApiError.badRequest('Cannot upload more than 5 images per item.', 'MAX_IMAGES_EXCEEDED');
    }

    const uploadPromises = files.map((file) => this.uploadImageBuffer(file.buffer, folder));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete an image from Cloudinary by its public ID
   *
   * @param {string} publicId
   */
  async deleteImage(publicId) {
    if (!publicId || publicId.startsWith('fallback_') || publicId.startsWith('dev_') || !isCloudinaryConfigured()) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.warn(`[Cloudinary] Failed to delete image ${publicId}: ${error.message}`);
    }
  }
};

export default uploadService;
