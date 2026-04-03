const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: [true, 'Type is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  plainDescription: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    default: 'Other',
    enum: [
      'Food & Dining',
      'Transport',
      'Shopping',
      'Entertainment',
      'Utilities',
      'Health',
      'Education',
      'Subscriptions',
      'Rent & Housing',
      'Transfers',
      'Salary',
      'Freelance',
      'Investment',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Cash', 'Net Banking', 'Other'],
    default: 'Other'
  },
  source: {
    type: String,
    enum: ['manual', 'csv', 'recurring'],
    default: 'manual'
  },
  aiCategorized: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  userOverridden: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', ''],
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
