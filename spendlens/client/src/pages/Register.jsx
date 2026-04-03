import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to SpendLens! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>

      <div className="auth-container animate-in">
        <div className="auth-header">
          <div className="auth-logo">
            <HiOutlineSparkles />
          </div>
          <h1>Create account</h1>
          <p>Start tracking your expenses with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <HiOutlineUser className="input-icon" />
              <input
                id="name"
                type="text"
                className="input input-icon-padding"
                placeholder="Rahul Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email</label>
            <div className="input-with-icon">
              <HiOutlineMail className="input-icon" />
              <input
                id="reg-email"
                type="email"
                className="input input-icon-padding"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password</label>
            <div className="input-with-icon">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="reg-password"
                type="password"
                className="input input-icon-padding"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
            id="register-submit"
          >
            {loading ? <span className="loader" style={{ width: 20, height: 20 }}></span> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
        }
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }
        .auth-bg-orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 212, 255, 0.15);
          top: -100px;
          right: -100px;
        }
        .auth-bg-orb-2 {
          width: 350px;
          height: 350px;
          background: rgba(124, 58, 237, 0.15);
          bottom: -80px;
          left: -80px;
        }
        .auth-container {
          width: 100%;
          max-width: 420px;
          padding: var(--space-2xl);
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          position: relative;
          z-index: 1;
        }
        .auth-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }
        .auth-logo {
          width: 56px;
          height: 56px;
          margin: 0 auto var(--space-lg);
          border-radius: var(--radius-lg);
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        }
        .auth-header h1 {
          font-size: 1.5rem;
          margin-bottom: var(--space-xs);
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .input-icon-padding {
          padding-left: 42px !important;
        }
        .auth-footer {
          text-align: center;
          margin-top: var(--space-xl);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .auth-link {
          color: var(--accent-cyan);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Register;
