import multer from 'multer';

// We use memoryStorage because we will stream the buffer directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit 5MB
  }
});