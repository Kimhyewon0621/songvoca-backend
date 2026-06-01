const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const { authenticate } = require('../middleware/authMiddleware');

// My whole word
router.get('/', authenticate, wordController.getAll);

// Delete word
router.delete('/:id', authenticate, wordController.remove);

module.exports = router;