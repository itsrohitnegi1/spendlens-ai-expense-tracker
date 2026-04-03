export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    'Food & Dining': '#fb923c',
    'Transport': '#00d4ff',
    'Shopping': '#f472b6',
    'Entertainment': '#7c3aed',
    'Utilities': '#fbbf24',
    'Health': '#34d399',
    'Education': '#60a5fa',
    'Subscriptions': '#a78bfa',
    'Rent & Housing': '#f87171',
    'Transfers': '#94a3b8',
    'Salary': '#34d399',
    'Freelance': '#06b6d4',
    'Investment': '#fbbf24',
    'Other': '#64748b'
  };
  return colors[category] || '#64748b';
};

export const getCategoryIcon = (category) => {
  const icons = {
    'Food & Dining': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Utilities': '⚡',
    'Health': '🏥',
    'Education': '📚',
    'Subscriptions': '📱',
    'Rent & Housing': '🏠',
    'Transfers': '↔️',
    'Salary': '💰',
    'Freelance': '💻',
    'Investment': '📈',
    'Other': '📦'
  };
  return icons[category] || '📦';
};

export const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Utilities', 'Health', 'Education', 'Subscriptions',
  'Rent & Housing', 'Transfers', 'Salary', 'Freelance',
  'Investment', 'Other'
];

export const PAYMENT_METHODS = [
  'UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Cash', 'Net Banking', 'Other'
];
