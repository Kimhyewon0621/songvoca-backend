const express = require('express');
const router = express.Router();
const studyLogController = require('../controllers/studyLogController');
const { authenticate } = require('../middleware/authMiddleware');

// Record a study log
router.post('/', authenticate, studyLogController.create);

module.exports = router;