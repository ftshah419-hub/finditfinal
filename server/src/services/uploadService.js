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
    if (!isCloudinaryConfigured()) {
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
            return reject(
              new ApiError(500, `Cloudinary upload failed: ${error.message}`, 'UPLOAD_FAILED')
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
    if (!publicId || !isCloudinaryConfigured()) {
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
