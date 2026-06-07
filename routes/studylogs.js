const express = require('express');
const router = express.Router();
const studyLogController = require('../controllers/studyLogController');
const { authenticate } = require('../middleware/authMiddleware');

// Record a study log
router.post('/', authenticate, studyLogController.create);
// Get study logs (auth required, optional ?song_id=X)
router.get('/', authenticate, studyLogController.getAll);

module.exports = router;