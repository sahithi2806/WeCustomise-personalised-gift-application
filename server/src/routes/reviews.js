const router = require('express').Router();
const { submitReview } = require('../controllers/otherControllers');
const { authenticate } = require('../middleware/auth');
router.post('/', authenticate, submitReview);
module.exports = router;
