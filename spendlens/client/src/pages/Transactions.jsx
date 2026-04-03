import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { formatCurrency, formatDate, getCategoryIcon, CATEGORIES, PAYMENT_METHODS } from '../utils/helpers';
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlinePencil, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ category: '', type: '', paymentMethod: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await transactionAPI.getAll(params);
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateCategory = async (id) => {
    try {
      await transactionAPI.update(id, { category: editCategory });
      toast.success('Category updated');
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', type: '', paymentMethod: '', search: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Transactions</h1>
          <p>{total} total transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)} id="toggle-filters">
            <HiOutlineFilter /> Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
          </button>
          <Link to="/add" className="btn btn-primary" id="add-txn-btn">
            <HiOutlinePlusCircle /> Add New
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 'var(--space-md)', alignItems: 'end' }}>
            <div className="input-group">
              <label>Search</label>
              <input
                className="input"
                placeholder="Search descriptions..."
                value={filters.search}
                onChange={e => { setFilters({...filters, search: e.target.value}); setPage(1); }}
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select className="input" value={filters.category} onChange={e => { setFilters({...filters, category: e.target.value}); setPage(1); }}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input" value={filters.type} onChange={e => { setFilters({...filters, type: e.target.value}); setPage(1); }}>
                <option value="">All Types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="input-group">
              <label>Payment Method</label>
              <select className="input" value={filters.paymentMethod} onChange={e => { setFilters({...filters, paymentMethod: e.target.value}); setPage(1); }}>
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={clearFilters}>
                <HiOutlineX /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="page-loader"><div className="loader"></div></div>
        ) : transactions.length > 0 ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1rem', flexShrink: 0
                        }}>
                          {getCategoryIcon(txn.category)}
                        </span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                            {txn.plainDescription || txn.description}
                          </div>
                          {txn.plainDescription && txn.plainDescription !== txn.description && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {txn.description}
                            </div>
                          )}
                          {txn.aiCategorized && (
                            <span style={{
                              fontSize: '0.6rem', color: 'var(--accent-cyan)',
                              background: 'rgba(0,212,255,0.08)', padding: '1px 6px',
                              borderRadius: 'var(--radius-full)', marginTop: 2, display: 'inline-block'
                            }}>
                              AI · {Math.round(txn.aiConfidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingId === txn._id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <select className="input" value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button className="btn btn-sm btn-primary" onClick={() => handleUpdateCategory(txn._id)}>✓</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>✕</button>
                        </div>
                      ) : (
                        <span className={`category-badge ${txn.category.toLowerCase().split(' ')[0]}`}>
                          {txn.category}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{formatDate(txn.date)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{txn.paymentMethod}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontFamily: 'var(--font-heading)',
                        color: txn.type === 'income' ? 'var(--accent-green)' : 'var(--text-primary)'
                      }}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => { setEditingId(txn._id); setEditCategory(txn.category); }}
                          title="Edit category"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn btn-icon btn-ghost btn-sm"
                          onClick={() => handleDelete(txn._id)}
                          title="Delete"
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 'var(--space-md)', padding: 'var(--space-lg)',
                borderTop: '1px solid var(--border)'
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >Previous</button>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No transactions found</h3>
            <p>{hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding your first transaction'}</p>
            {!hasActiveFilters && (
              <Link to="/add" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                <HiOutlinePlusCircle /> Add Transaction
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
