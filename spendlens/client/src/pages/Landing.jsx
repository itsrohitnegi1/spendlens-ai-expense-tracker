import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineChatAlt2, HiOutlineCreditCard, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineLightningBolt } from 'react-icons/hi';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Background Effects */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px',
        borderRadius: '50%', background: 'rgba(0, 212, 255, 0.06)', filter: 'blur(120px)'
      }}></div>
      <div style={{
        position: 'fixed', bottom: '-200px', left: '-200px', width: '500px', height: '500px',
        borderRadius: '50%', background: 'rgba(124, 58, 237, 0.06)', filter: 'blur(120px)'
      }}></div>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-lg) var(--space-2xl)', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem'
          }}>
            <HiOutlineSparkles />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SpendLens
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: 'var(--space-3xl) var(--space-2xl)',
        textAlign: 'center', position: 'relative', zIndex: 10
      }}>
        <div className="animate-in" style={{ marginBottom: 'var(--space-xl)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem', color: 'var(--accent-cyan)', fontWeight: 500
          }}>
            <HiOutlineLightningBolt /> AI-Powered Finance Tracking
          </span>
        </div>

        <h1 className="animate-in" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800,
          lineHeight: 1.1, marginBottom: 'var(--space-lg)', animationDelay: '100ms',
          fontFamily: 'var(--font-heading)'
        }}>
          Know Exactly Where<br />
          <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Money Goes
          </span>
        </h1>

        <p className="animate-in" style={{
          fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: 600,
          margin: '0 auto var(--space-xl)', lineHeight: 1.7, animationDelay: '200ms'
        }}>
          Transactions scattered across UPI, cards, wallets, and subscriptions?
          SpendLens uses AI to unify, categorize, and explain your spending in plain language.
        </p>

        <div className="animate-in" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', animationDelay: '300ms' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '16px 32px' }}>
            Start Tracking Free <HiOutlineArrowRight />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: '1rem', padding: '16px 32px' }}>
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="animate-in" style={{
          display: 'flex', justifyContent: 'center', gap: 'var(--space-3xl)',
          marginTop: 'var(--space-3xl)', animationDelay: '400ms'
        }}>
          {[
            { value: '10K+', label: 'Transactions Tracked' },
            { value: '99%', label: 'AI Accuracy' },
            { value: '₹0', label: 'Forever Free' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-3xl) var(--space-2xl)', position: 'relative', zIndex: 10 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-xs)', fontSize: '2rem' }}>
          Supercharged Features
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-2xl)', fontSize: '1rem' }}>
          Everything you need to master your money
        </p>

        <div className="grid grid-3">
          {[
            { icon: <HiOutlineSparkles />, color: '#00d4ff', title: 'AI Auto-Categorize', desc: 'AI understands "IRCTC PNR 4823910" is a train ticket and categorizes it automatically.' },
            { icon: <HiOutlineChartBar />, color: '#7c3aed', title: 'Visual Analytics', desc: 'Beautiful charts showing spending trends, category breakdowns, and payment method splits.' },
            { icon: <HiOutlineChatAlt2 />, color: '#f472b6', title: 'AI Chat Assistant', desc: 'Ask "Where did my money go?" and get data-backed insights in plain English.' },
            { icon: <HiOutlineCreditCard />, color: '#34d399', title: 'All Payment Methods', desc: 'Track UPI, credit cards, debit cards, wallets, and cash — all in one place.' },
            { icon: <HiOutlineShieldCheck />, color: '#fbbf24', title: 'CSV Import', desc: 'Upload your bank statement CSV and let AI categorize hundreds of transactions instantly.' },
            { icon: <HiOutlineLightningBolt />, color: '#fb923c', title: 'Budget Alerts', desc: 'Set category-wise budgets and get real-time progress tracking on your spending.' }
          ].map((feature, i) => (
            <div key={i} className="glass glass-hover animate-in" style={{ padding: 'var(--space-xl)', animationDelay: `${i * 80}ms` }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: `${feature.color}18`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.25rem', color: feature.color,
                marginBottom: 'var(--space-md)'
              }}>
                {feature.icon}
              </div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>{feature.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 800, margin: 'var(--space-2xl) auto', padding: 'var(--space-3xl) var(--space-2xl)',
        textAlign: 'center', position: 'relative', zIndex: 10
      }}>
        <div className="glass" style={{
          padding: 'var(--space-3xl) var(--space-2xl)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'var(--gradient-brand)'
          }}></div>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>Ready to take control of your finances?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '1rem' }}>
            Join thousands of users who track smarter with AI
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '16px 40px' }}>
            Get Started — It's Free <HiOutlineArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: 'var(--space-xl)', borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '0.8125rem'
      }}>
        SpendLens © {new Date().getFullYear()} · Built with MERN + Gemini AI
      </footer>
    </div>
  );
};

export default Landing;
