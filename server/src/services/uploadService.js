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
      if (isDev) {
        console.warn('[Cloudinary] Cloudinary not configured in .env. Using development data URI fallback.');
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45;
        const format = isPng ? 'png' : isWebp ? 'webp' : 'jpeg';
        return {
          url: `data:image/${format};base64,${buffer.toString('base64')}`,
          publicId: `dev_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          format
        };
      }

      throw ApiError.internal(
        'Cloudinary credentials are not configured on the server. Image upload is unavailable.',
        'CLOUDINARY_NOT_CONFIGURED'
      );
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
            console.warn(`[Cloudinary] Remote upload failed: ${error.message} (HTTP ${error.http_code || 500})`);

            // In development, fall back gracefully to data URI so local testing is never blocked
            if (isDev) {
              console.warn('[Cloudinary] Falling back to development base64 Data URI for uploaded image.');
              const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
              const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45;
              const format = isPng ? 'png' : isWebp ? 'webp' : 'jpeg';
              return resolve({
                url: `data:image/${format};base64,${buffer.toString('base64')}`,
                publicId: `dev_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                format
              });
            }

            let errorMsg = `Cloudinary upload failed: ${error.message}`;
            if (error.http_code === 403 || error.message?.includes('403')) {
              errorMsg = `Cloudinary upload failed (HTTP 403): The configured API key lacks 'create' (upload) permission. Please check your Cloudinary Console access keys or update server/.env.`;
            }

            return reject(
              new ApiError(500, errorMsg, 'UPLOAD_FAILED')
            );
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
    if (!publicId || publicId.startsWith('dev_') || !isCloudinaryConfigured()) {
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
