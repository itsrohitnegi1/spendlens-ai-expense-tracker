const Transaction = require('../models/Transaction');
const { categorizeTransaction, generateInsights, chatAboutSpending } = require('../services/geminiService');

// @desc    Categorize a single transaction description
// @route   POST /api/ai/categorize
const categorize = async (req, res, next) => {
  try {
    const { description, amount, type } = req.body;
    if (!description) {
      res.status(400);
      throw new Error('Description is required');
    }
    const result = await categorizeTransaction(description, amount || 0, type || 'expense');
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI spending insights for a month
// @route   POST /api/ai/insights
const insights = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('-date');

    if (transactions.length === 0) {
      return res.json({
        summary: 'No transactions found for this period.',
        insights: ['Start adding transactions to get AI-powered insights!'],
        tips: [],
        anomalies: []
      });
    }

    const result = await generateInsights(transactions, m, y);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI about spending
// @route   POST /api/ai/chat
const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error('Message is required');
    }

    // Get recent transactions for context
    const transactions = await Transaction.find({ user: req.user._id })
      .sort('-date')
      .limit(100);

    const result = await chatAboutSpending(message, transactions);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { categorize, insights, chat };
