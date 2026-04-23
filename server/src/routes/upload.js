const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { uploadImage } = require('../controllers/otherControllers');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/', authenticate, upload.single('image'), uploadImage);
module.exports = router;
