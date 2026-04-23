const router = require('express').Router();
const { scheduleGift, getGifts } = require('../controllers/otherControllers');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.post('/', scheduleGift);
router.get('/', getGifts);
module.exports = router;
