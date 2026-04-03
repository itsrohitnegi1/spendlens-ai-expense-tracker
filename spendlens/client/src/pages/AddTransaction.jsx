import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, aiAPI } from '../services/api';
import { CATEGORIES, PAYMENT_METHODS, getCategoryIcon } from '../utils/helpers';
import { HiOutlinePlusCircle, HiOutlineUpload, HiOutlineSparkles, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AddTransaction = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [tab, setTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    category: '',
    tags: ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // AI auto-categorize on blur
  const handleDescriptionBlur = async () => {
    if (form.description.length < 3) return;
    try {
      const { data } = await aiAPI.categorize({
        description: form.description,
        amount: parseFloat(form.amount) || 0,
        type: form.type
      });
      setAiSuggestion(data);
      if (data.category && !form.category) {
        setForm(prev => ({ ...prev, category: data.category }));
      }
    } catch {
      // Silent fail for AI — user can still manually set category
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      return toast.error('Description and amount are required');
    }
    setLoading(true);
    try {
      await transactionAPI.add({
        ...form,
        amount: parseFloat(form.amount),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      });
      toast.success('Transaction added! 🎉');
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Please select a CSV file');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await transactionAPI.uploadCSV(formData);
      toast.success(`Imported ${data.count} transactions! 🎉`);
      navigate('/transactions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Add Transaction</h1>
        <p>Record a new expense or income</p>
      </div>

      {/* Tab Switcher */}
      <div className="glass" style={{ display: 'inline-flex', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
        <button
          className={`btn ${tab === 'manual' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('manual')}
        >
          <HiOutlinePlusCircle /> Manual Entry
        </button>
        <button
          className={`btn ${tab === 'csv' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setTab('csv')}
        >
          <HiOutlineUpload /> CSV Upload
        </button>
      </div>

      {tab === 'manual' ? (
        <form onSubmit={handleSubmit} className="glass animate-in" style={{ padding: 'var(--space-xl)' }} id="add-txn-form">
          {/* Type Toggle */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
            <button
              type="button"
              className={`btn ${form.type === 'expense' ? '' : 'btn-ghost'}`}
              style={form.type === 'expense' ? { background: 'rgba(244,114,182,0.15)', color: 'var(--accent-pink)', border: '1px solid rgba(244,114,182,0.3)' } : {}}
              onClick={() => handleChange('type', 'expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`btn ${form.type === 'income' ? '' : 'btn-ghost'}`}
              style={form.type === 'income' ? { background: 'rgba(52,211,153,0.15)', color: 'var(--accent-green)', border: '1px solid rgba(52,211,153,0.3)' } : {}}
              onClick={() => handleChange('type', 'income')}
            >
              Income
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description *</label>
              <input
                className="input"
                placeholder="e.g., Swiggy order, Uber ride, Netflix subscription..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                onBlur={handleDescriptionBlur}
                required
                id="txn-description"
              />
            </div>

            <div className="input-group">
              <label>Amount (₹) *</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => handleChange('amount', e.target.value)}
                required
                id="txn-amount"
              />
            </div>

            <div className="input-group">
              <label>Date</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
                id="txn-date"
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <select className="input" value={form.category} onChange={e => handleChange('category', e.target.value)} id="txn-category">
                <option value="">Auto-detect (AI)</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={e => handleChange('paymentMethod', e.target.value)} id="txn-payment">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tags (comma-separated)</label>
              <input
                className="input"
                placeholder="e.g., food, work, personal"
                value={form.tags}
                onChange={e => handleChange('tags', e.target.value)}
                id="txn-tags"
              />
            </div>
          </div>

          {/* AI Suggestion */}
          {aiSuggestion && (
            <div className="animate-in" style={{
              padding: 'var(--space-md)', marginBottom: 'var(--space-lg)',
              background: 'rgba(0, 212, 255, 0.06)', border: '1px solid rgba(0, 212, 255, 0.15)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <HiOutlineSparkles style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>AI Suggestion</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {Math.round(aiSuggestion.confidence * 100)}% confidence
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span>📁 {aiSuggestion.category}</span>
                {aiSuggestion.subcategory && <span>· {aiSuggestion.subcategory}</span>}
                {aiSuggestion.plainDescription && <span>· "{aiSuggestion.plainDescription}"</span>}
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{ marginTop: 'var(--space-sm)', background: 'rgba(0,212,255,0.12)', color: 'var(--accent-cyan)' }}
                onClick={() => setForm(prev => ({ ...prev, category: aiSuggestion.category }))}
              >
                <HiOutlineCheck /> Apply Suggestion
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="submit-txn">
            {loading ? <span className="loader" style={{ width: 20, height: 20 }}></span> : (
              <><HiOutlinePlusCircle /> Add Transaction</>
            )}
          </button>
        </form>
      ) : (
        <div className="glass animate-in" style={{ padding: 'var(--space-xl)' }}>
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3xl) var(--space-xl)', textAlign: 'center',
            transition: 'all var(--transition-base)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)', opacity: 0.5 }}>📄</div>
            <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>Upload Bank Statement</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
              CSV files supported. Columns: date, description, amount, type (debit/credit)
            </p>
            <input type="file" accept=".csv" ref={fileRef} style={{ display: 'none' }} id="csv-file-input" />
            <button
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              style={{ marginBottom: 'var(--space-md)' }}
            >
              <HiOutlineUpload /> Choose CSV File
            </button>
            <br />
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCSVUpload}
              disabled={loading}
              style={{ marginTop: 'var(--space-md)' }}
              id="upload-csv-btn"
            >
              {loading ? <span className="loader" style={{ width: 20, height: 20 }}></span> : 'Upload & Categorize with AI'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTransaction;
