import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Configure in-memory storage so buffers can be streamed to Cloudinary
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type '${file.mimetype}'. Only JPG, JPEG, PNG, and WebP images are allowed.`,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

// Base multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5 // Maximum 5 files per request
  }
});

/**
 * Middleware for handling up to 5 item images ('images' field)
 */
export const uploadItemImages = upload.array('images', 5);

/**
 * Middleware for single image upload ('image' or 'profileImage' field)
 */
export const uploadSingleImage = upload.single('image');

export default {
  upload,
  uploadItemImages,
  uploadSingleImage
};
