import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { HiOutlineUser, HiOutlineCurrencyRupee, HiOutlineSave } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthlyBudget: user?.monthlyBudget || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: form.name,
        currency: form.currency,
        monthlyBudget: parseInt(form.monthlyBudget) || 0
      });
      updateUser(data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="glass animate-in" style={{ padding: 'var(--space-xl)' }} id="settings-form">
        <h3 style={{ marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <HiOutlineUser style={{ color: 'var(--accent-cyan)' }} />
          Profile
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              className="input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              id="settings-name"
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email cannot be changed</span>
          </div>

          <div className="input-group">
            <label>Currency</label>
            <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} id="settings-currency">
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <HiOutlineCurrencyRupee /> Monthly Budget
            </label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 30000"
              value={form.monthlyBudget}
              onChange={e => setForm({ ...form, monthlyBudget: e.target.value })}
              id="settings-budget"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Set to 0 to disable budget tracking
            </span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-xl)' }} disabled={loading} id="save-settings">
          {loading ? <span className="loader" style={{ width: 20, height: 20 }}></span> : (
            <><HiOutlineSave /> Save Changes</>
          )}
        </button>
      </form>

      {/* App Info */}
      <div className="glass animate-in" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)', animationDelay: '200ms' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>About SpendLens</h3>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p>SpendLens is an AI-powered expense tracker that helps you understand where your money goes.</p>
          <p style={{ marginTop: 'var(--space-sm)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Features:</strong> Auto-categorization via Gemini AI, CSV import, spending analytics, AI chat assistant, budget tracking.
          </p>
          <p style={{ marginTop: 'var(--space-sm)', color: 'var(--text-muted)' }}>
            Version 1.0.0 · Built with MERN Stack + Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
