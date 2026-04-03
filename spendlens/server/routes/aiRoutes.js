const express = require('express');
const { categorize, insights, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/categorize', categorize);
router.post('/insights', insights);
router.post('/chat', chat);

module.exports = router;
