const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { uploadImage } = require('../controllers/otherControllers');

const router = express.Router();

// Disk-first, Cloudinary opt-in. Cloudinary is declared in package.json but was
// never installed and is referenced nowhere, so a Cloudinary-first route would
// crash on `require` — and would fail in any fresh checkout. Serving from disk
// means uploads work with zero configuration.
const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

let upload;
if (useCloudinary) {
  try {
    const { v2: cloudinary } = require('cloudinary');
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    cloudinary.config({ url: process.env.CLOUDINARY_URL });
    upload = multer({
      storage: CloudinaryStorage({
        folder: 'wecustomise',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      }),
    });
  } catch (error) {
    console.error('Cloudinary configured but unavailable, falling back to disk:', error.message);
    upload = null;
  }
}

if (!upload) {
  const uploadsDir = path.join(__dirname, '../../uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const stamp = Date.now().toString(36);
        const safe = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_').slice(0, 60);
        cb(null, `${stamp}_${safe}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed.'));
      }
      cb(null, true);
    },
  });
}

router.post('/', authenticate, upload.single('image'), uploadImage);
module.exports = router;