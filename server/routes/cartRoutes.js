const express = require('express');
const {
  getCart,
  addOrUpdateItem,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/items', addOrUpdateItem);
router.patch('/items', addOrUpdateItem);
router.delete('/items', removeItem);
router.delete('/', clearCart);

module.exports = router;
