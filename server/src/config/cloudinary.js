import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  console.warn('[Cloudinary] Warning: Cloudinary credentials not fully configured in .env. Uploads will be disabled until configured.');
}

export const isCloudinaryConfigured = () => {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

export default cloudinary;
