const express = require('express');
const multer = require('multer');
const {
  getTransactions,
  addTransaction,
  bulkCSVUpload,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
  getSummary
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer for CSV uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.use(protect);

router.get('/analytics', getAnalytics);
router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', addTransaction);
router.post('/bulk-csv', upload.single('file'), bulkCSVUpload);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
