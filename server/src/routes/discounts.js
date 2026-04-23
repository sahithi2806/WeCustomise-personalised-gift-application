const router = require('express').Router();
const { validateDiscount } = require('../controllers/otherControllers');
const { authenticate } = require('../middleware/auth');
router.post('/validate', authenticate, validateDiscount);
module.exports = router;
