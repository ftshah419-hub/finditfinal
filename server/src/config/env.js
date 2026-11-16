import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve the .env path in server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI?.trim() || '',
  JWT_SECRET: process.env.JWT_SECRET?.trim() || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim() || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim() || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim() || ''
};

export const validateEnv = () => {
  const missing = [];

  if (!env.MONGODB_URI || env.MONGODB_URI.includes('YOUR_USERNAME')) {
    missing.push('MONGODB_URI');
  }

  if (!env.JWT_SECRET || env.JWT_SECRET === 'REPLACE_WITH_A_LONG_RANDOM_SECRET') {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      missing,
      message: `Required environment variables missing or unset in server/.env: [${missing.join(', ')}]. Please configure them before starting the application.`
    };
  }

  return {
    isValid: true,
    missing: []
  };
};

export default env;
