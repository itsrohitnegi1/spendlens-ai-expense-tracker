const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️  Gemini API key not set. AI features will use fallback categorization.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized');
    return true;
  } catch (error) {
    console.warn('⚠️  Gemini init failed:', error.message);
    return false;
  }
};

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Utilities', 'Health', 'Education', 'Subscriptions',
  'Rent & Housing', 'Transfers', 'Salary', 'Freelance',
  'Investment', 'Other'
];

// Rule-based fallback for common patterns
const ruleBasedCategorize = (description, amount) => {
  const desc = description.toLowerCase();
  const rules = [
    { patterns: ['swiggy', 'zomato', 'food', 'restaurant', 'cafe', 'coffee', 'starbucks', 'dominos', 'pizza', 'burger', 'biryani', 'lunch', 'dinner', 'breakfast', 'grocery', 'bigbasket', 'blinkit', 'zepto'], category: 'Food & Dining', sub: 'Delivery' },
    { patterns: ['uber', 'ola', 'rapido', 'metro', 'train', 'irctc', 'bus', 'flight', 'petrol', 'diesel', 'fuel', 'parking', 'toll'], category: 'Transport', sub: 'Ride' },
    { patterns: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'mall', 'shop', 'cloth', 'shoe'], category: 'Shopping', sub: 'Online' },
    { patterns: ['netflix', 'spotify', 'hotstar', 'prime', 'youtube', 'subscription', 'jio', 'airtel', 'vi ', 'recharge'], category: 'Subscriptions', sub: 'Digital' },
    { patterns: ['electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'bill'], category: 'Utilities', sub: 'Bills' },
    { patterns: ['movie', 'cinema', 'pvr', 'inox', 'game', 'concert', 'event', 'party'], category: 'Entertainment', sub: 'Leisure' },
    { patterns: ['hospital', 'doctor', 'pharmacy', 'medicine', 'medical', 'health', 'gym', 'fitness'], category: 'Health', sub: 'Medical' },
    { patterns: ['rent', 'housing', 'maintenance', 'society', 'emi', 'loan'], category: 'Rent & Housing', sub: 'Rent' },
    { patterns: ['salary', 'payroll', 'stipend', 'wages'], category: 'Salary', sub: 'Monthly' },
    { patterns: ['freelance', 'client', 'project payment', 'consulting'], category: 'Freelance', sub: 'Project' },
    { patterns: ['mutual fund', 'stock', 'invest', 'sip', 'fd', 'ppf', 'nps'], category: 'Investment', sub: 'Savings' },
    { patterns: ['transfer', 'sent to', 'received from', 'upi', 'neft', 'imps'], category: 'Transfers', sub: 'P2P' },
    { patterns: ['course', 'udemy', 'college', 'school', 'book', 'tuition', 'coaching', 'exam'], category: 'Education', sub: 'Learning' },
  ];

  for (const rule of rules) {
    if (rule.patterns.some(p => desc.includes(p))) {
      return {
        category: rule.category,
        subcategory: rule.sub,
        plainDescription: description,
        confidence: 0.7
      };
    }
  }

  return {
    category: 'Other',
    subcategory: 'General',
    plainDescription: description,
    confidence: 0.3
  };
};

// AI-powered categorization via Gemini
const categorizeTransaction = async (description, amount, type = 'expense') => {
  // Try AI first if available
  if (model) {
    try {
      const prompt = `You are a personal finance assistant for Indian users. Categorize this transaction:

Description: "${description}"
Amount: ₹${amount}
Type: ${type}

Available categories: ${CATEGORIES.join(', ')}

Respond ONLY with valid JSON, no markdown, no code blocks:
{
  "category": "one category from the list above",
  "subcategory": "specific sub-type (e.g., Delivery, Ride, Online, Bills)",
  "plainDescription": "rewrite the description in simple, clear English (e.g., 'IRCTC PNR 4823910' becomes 'Train ticket booking')",
  "confidence": 0.0 to 1.0
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      // Strip markdown code blocks if present
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      // Validate category
      if (!CATEGORIES.includes(parsed.category)) {
        parsed.category = 'Other';
      }
      parsed.confidence = Math.min(1, Math.max(0, parsed.confidence || 0.8));
      return parsed;
    } catch (error) {
      console.warn('Gemini categorization failed, using fallback:', error.message);
    }
  }

  // Fallback to rule-based
  return ruleBasedCategorize(description, amount);
};

// Bulk categorize multiple transactions
const categorizeTransactionsBulk = async (transactions) => {
  const results = [];
  for (const txn of transactions) {
    const result = await categorizeTransaction(txn.description, txn.amount, txn.type);
    results.push({ ...txn, ...result, aiCategorized: true });
    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
};

// Generate monthly spending insights
const generateInsights = async (transactions, month, year) => {
  if (!model) {
    // Fallback insights
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const topCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      topCategory[t.category] = (topCategory[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);

    return {
      summary: `You spent ₹${totalExpense.toLocaleString('en-IN')} and earned ₹${totalIncome.toLocaleString('en-IN')} this month.`,
      insights: [
        sorted.length > 0 ? `Your highest spending category was ${sorted[0][0]} at ₹${sorted[0][1].toLocaleString('en-IN')}.` : 'No expenses recorded yet.',
        totalIncome > totalExpense ? `Great! You saved ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} this month.` : `You overspent by ₹${(totalExpense - totalIncome).toLocaleString('en-IN')}.`,
        `You made ${transactions.length} transactions in total.`
      ],
      tips: ['Track daily expenses to stay within budget.', 'Consider setting category-wise budgets.']
    };
  }

  try {
    const summary = transactions.map(t =>
      `${t.date.toLocaleDateString('en-IN')}: ${t.type} ₹${t.amount} — ${t.plainDescription || t.description} [${t.category}] via ${t.paymentMethod}`
    ).join('\n');

    const prompt = `You are a friendly personal finance coach. Analyze these transactions for ${month}/${year} and provide actionable insights in plain English. Be specific with numbers.

Transactions:
${summary}

Respond ONLY with valid JSON, no markdown:
{
  "summary": "One-line summary of the month",
  "insights": ["insight1", "insight2", "insight3", "insight4"],
  "tips": ["saving tip 1", "saving tip 2"],
  "anomalies": ["any unusual spending patterns"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn('Gemini insights failed:', error.message);
    return { summary: 'Unable to generate AI insights at this time.', insights: [], tips: [], anomalies: [] };
  }
};

// Chat about spending
const chatAboutSpending = async (message, transactions) => {
  if (!model) {
    return { reply: 'AI assistant is not available. Please configure your Gemini API key in the .env file to enable AI features.' };
  }

  try {
    const context = transactions.slice(0, 50).map(t =>
      `${t.date.toLocaleDateString('en-IN')}: ${t.type} ₹${t.amount} — ${t.plainDescription || t.description} [${t.category}]`
    ).join('\n');

    const prompt = `You are SpendLens AI, a friendly personal finance assistant for Indian users. The user is asking about their spending.

Recent transactions context:
${context}

User message: "${message}"

Respond naturally and helpfully in 2-4 sentences. Reference specific data from their transactions when relevant. Use ₹ symbol for amounts. Be encouraging and practical.`;

    const result = await model.generateContent(prompt);
    return { reply: result.response.text().trim() };
  } catch (error) {
    return { reply: 'I encountered an issue processing your request. Please try again in a moment.' };
  }
};

module.exports = {
  initGemini,
  categorizeTransaction,
  categorizeTransactionsBulk,
  generateInsights,
  chatAboutSpending,
  CATEGORIES
};
