const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { categorizeTransaction, categorizeTransactionsBulk } = require('../services/geminiService');
const { parseCSV } = require('../utils/csvParser');

// @desc    Get all transactions for user
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      paymentMethod,
      startDate,
      endDate,
      search,
      sort = '-date'
    } = req.query;

    const query = { user: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { plainDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      transactions,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add single transaction
// @route   POST /api/transactions
const addTransaction = async (req, res, next) => {
  try {
    const { amount, type, description, date, paymentMethod, category, tags } = req.body;

    if (!amount || !type || !description) {
      res.status(400);
      throw new Error('Amount, type, and description are required');
    }

    let aiData = { category: category || 'Other', subcategory: '', plainDescription: description, aiCategorized: false, aiConfidence: 0 };

    // Auto-categorize if no category provided
    if (!category || category === 'Other') {
      const categorized = await categorizeTransaction(description, amount, type);
      aiData = {
        category: categorized.category,
        subcategory: categorized.subcategory,
        plainDescription: categorized.plainDescription || description,
        aiCategorized: true,
        aiConfidence: categorized.confidence
      };
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      description,
      plainDescription: aiData.plainDescription,
      category: aiData.category,
      subcategory: aiData.subcategory,
      paymentMethod: paymentMethod || 'Other',
      source: 'manual',
      aiCategorized: aiData.aiCategorized,
      aiConfidence: aiData.aiConfidence,
      tags: tags || [],
      date: date || new Date()
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CSV and bulk categorize
// @route   POST /api/transactions/bulk-csv
const bulkCSVUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a CSV file');
    }

    const parsed = await parseCSV(req.file.buffer);
    if (parsed.length === 0) {
      res.status(400);
      throw new Error('No valid transactions found in CSV');
    }

    // AI categorize all
    const categorized = await categorizeTransactionsBulk(parsed);

    // Bulk insert
    const transactions = await Transaction.insertMany(
      categorized.map(t => ({
        user: req.user._id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        plainDescription: t.plainDescription || t.description,
        category: t.category,
        subcategory: t.subcategory || '',
        paymentMethod: t.paymentMethod || 'Other',
        source: 'csv',
        aiCategorized: true,
        aiConfidence: t.confidence || 0.5,
        date: t.date || new Date()
      }))
    );

    res.status(201).json({
      message: `Successfully imported ${transactions.length} transactions`,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    const updates = req.body;

    // If user changes category from AI suggestion, mark as overridden
    if (updates.category && updates.category !== transaction.category && transaction.aiCategorized) {
      updates.userOverridden = true;
    }

    const updated = await Transaction.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/transactions/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    // Category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Payment method breakdown
    const paymentBreakdown = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Daily spending trend
    const dailyTrend = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly totals
    const totals = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const expenseTotal = totals.find(t => t._id === 'expense')?.total || 0;
    const incomeTotal = totals.find(t => t._id === 'income')?.total || 0;
    const txnCount = totals.reduce((s, t) => s + t.count, 0);

    // Budget comparison
    const budgets = await Budget.find({ user: req.user._id, month: m, year: y });
    const budgetComparison = budgets.map(b => {
      const spent = categoryBreakdown.find(c => c._id === b.category)?.total || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent,
        percentage: b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0,
        remaining: b.limit - spent
      };
    });

    res.json({
      month: m,
      year: y,
      totalExpense: expenseTotal,
      totalIncome: incomeTotal,
      balance: incomeTotal - expenseTotal,
      transactionCount: txnCount,
      categoryBreakdown,
      paymentBreakdown,
      dailyTrend,
      budgetComparison
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly summary
// @route   GET /api/transactions/summary
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month totals
    const currentTotals = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: currentMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Last month totals
    const lastTotals = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    // Recent transactions
    const recent = await Transaction.find({ user: req.user._id })
      .sort('-date')
      .limit(5);

    // Top categories this month
    const topCategories = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: currentMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    const curExpense = currentTotals.find(t => t._id === 'expense')?.total || 0;
    const curIncome = currentTotals.find(t => t._id === 'income')?.total || 0;
    const prevExpense = lastTotals.find(t => t._id === 'expense')?.total || 0;
    const prevIncome = lastTotals.find(t => t._id === 'income')?.total || 0;

    res.json({
      currentMonth: {
        expense: curExpense,
        income: curIncome,
        balance: curIncome - curExpense,
        transactionCount: currentTotals.reduce((s, t) => s + (t.count || 0), 0)
      },
      lastMonth: {
        expense: prevExpense,
        income: prevIncome
      },
      expenseChange: prevExpense > 0 ? Math.round(((curExpense - prevExpense) / prevExpense) * 100) : 0,
      incomeChange: prevIncome > 0 ? Math.round(((curIncome - prevIncome) / prevIncome) * 100) : 0,
      recentTransactions: recent,
      topCategories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  bulkCSVUpload,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
  getSummary
};
