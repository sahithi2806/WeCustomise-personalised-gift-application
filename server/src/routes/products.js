const router = require('express').Router();
const { getProducts, getProduct, getCategories } = require('../controllers/productController');
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
module.exports = router;
