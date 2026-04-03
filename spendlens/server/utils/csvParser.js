const csvParser = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parse CSV buffer into array of transaction objects.
 * Supports common bank statement formats with flexible column mapping.
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        // Normalize column names to lowercase
        const normalized = {};
        Object.keys(row).forEach(key => {
          normalized[key.toLowerCase().trim()] = row[key]?.trim() || '';
        });

        // Flexible column mapping
        const amount = parseFloat(
          normalized.amount || normalized.debit || normalized.credit ||
          normalized.value || normalized.transaction_amount || '0'
        );

        const description =
          normalized.description || normalized.narration || normalized.details ||
          normalized.particular || normalized.remarks || normalized.memo ||
          normalized.transaction_description || 'Unknown transaction';

        const date =
          normalized.date || normalized.transaction_date || normalized.txn_date ||
          normalized.value_date || '';

        const type =
          (normalized.type || '').toLowerCase() === 'income' ? 'income' :
          normalized.credit && parseFloat(normalized.credit) > 0 ? 'income' : 'expense';

        const paymentMethod =
          normalized.payment_method || normalized.mode || normalized.channel || 'Other';

        if (amount > 0 && description) {
          results.push({
            amount: Math.abs(amount),
            description,
            date: date ? new Date(date) : new Date(),
            type,
            paymentMethod: ['UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Cash', 'Net Banking'].includes(paymentMethod) ? paymentMethod : 'Other',
            source: 'csv'
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

module.exports = { parseCSV };
