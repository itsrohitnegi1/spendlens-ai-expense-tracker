import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI, aiAPI } from '../services/api';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash, HiOutlineCreditCard, HiOutlineSparkles, HiOutlinePlusCircle, HiArrowSmRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, anlRes] = await Promise.all([
        transactionAPI.getSummary(),
        transactionAPI.getAnalytics({})
      ]);
      setSummary(sumRes.data);
      setAnalytics(anlRes.data);

      // Fetch AI insight in background
      try {
        const insightRes = await aiAPI.insights({});
        setAiInsight(insightRes.data);
      } catch (e) {
        // AI insight is optional
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  const cur = summary?.currentMonth || {};
  const pieData = analytics?.categoryBreakdown?.map(c => ({
    name: c._id,
    value: c.total,
    icon: getCategoryIcon(c._id)
  })) || [];

  const trendData = analytics?.dailyTrend?.map(d => ({
    day: d._id,
    expense: d.expense,
    income: d.income
  })) || [];

  return (
    <div className="page-container">
      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="glass stat-card cyan animate-in" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon"><HiOutlineCash /></div>
          <span className="stat-label">Total Balance</span>
          <span className="stat-value">{formatCurrency(cur.balance || 0)}</span>
          <span className={`stat-change ${(summary?.incomeChange || 0) >= 0 ? 'up' : 'down'}`}>
            {(summary?.incomeChange || 0) >= 0 ? '↑' : '↓'} {Math.abs(summary?.incomeChange || 0)}% vs last month
          </span>
        </div>

        <div className="glass stat-card green animate-in" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon"><HiOutlineTrendingUp /></div>
          <span className="stat-label">Income</span>
          <span className="stat-value">{formatCurrency(cur.income || 0)}</span>
          <span className="stat-change up">This month</span>
        </div>

        <div className="glass stat-card pink animate-in" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon"><HiOutlineTrendingDown /></div>
          <span className="stat-label">Expenses</span>
          <span className="stat-value">{formatCurrency(cur.expense || 0)}</span>
          <span className={`stat-change ${(summary?.expenseChange || 0) <= 0 ? 'up' : 'down'}`}>
            {(summary?.expenseChange || 0) > 0 ? '↑' : '↓'} {Math.abs(summary?.expenseChange || 0)}% vs last month
          </span>
        </div>

        <div className="glass stat-card purple animate-in" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon"><HiOutlineCreditCard /></div>
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{cur.transactionCount || 0}</span>
          <span className="stat-change up">This month</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Spending Trend Chart */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)', animationDelay: '300ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3>Spending Trend</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This Month</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#5a5e7d" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5a5e7d" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#121738', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  labelStyle={{ color: '#f0f2ff' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Area type="monotone" dataKey="expense" stroke="#f472b6" fill="url(#expGrad)" strokeWidth={2} name="Expense" />
                <Area type="monotone" dataKey="income" stroke="#34d399" fill="url(#incGrad)" strokeWidth={2} name="Income" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Add transactions to see your spending trend</p>
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)', animationDelay: '380ms' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>By Category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={getCategoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#121738', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'var(--space-sm)' }}>
                {pieData.slice(0, 6).map((c, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.7rem', color: 'var(--text-secondary)', padding: '4px 8px',
                    background: 'var(--surface)', borderRadius: 'var(--radius-full)'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoryColor(c.name) }}></span>
                    {c.icon} {c.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Transactions */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)', animationDelay: '460ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h3>Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-ghost btn-sm">
              View All <HiArrowSmRight />
            </Link>
          </div>

          {summary?.recentTransactions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {summary.recentTransactions.map((txn, i) => (
                <div key={txn._id} className="glass-hover" style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: '12px var(--space-md)', borderRadius: 'var(--radius-md)',
                  border: 'none', background: 'transparent'
                }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: 'var(--surface)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {getCategoryIcon(txn.category)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {txn.plainDescription || txn.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {txn.category} · {formatDate(txn.date)}
                    </div>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-heading)',
                    color: txn.type === 'income' ? 'var(--accent-green)' : 'var(--text-primary)'
                  }}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No transactions yet</h3>
              <p>Start by adding your first transaction</p>
              <Link to="/add" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                <HiOutlinePlusCircle /> Add Transaction
              </Link>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)', animationDelay: '540ms', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'var(--gradient-brand)', opacity: 0.8
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <HiOutlineSparkles style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }} />
            <h3>AI Insights</h3>
            <span style={{
              padding: '2px 8px', background: 'var(--gradient-brand)', color: 'white',
              fontSize: '0.6rem', fontWeight: 700, borderRadius: 'var(--radius-full)', letterSpacing: '0.05em'
            }}>BETA</span>
          </div>

          {aiInsight?.insights?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {aiInsight.summary && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.6 }}>
                  {aiInsight.summary}
                </p>
              )}
              {aiInsight.insights.map((insight, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start',
                  padding: 'var(--space-md)', background: 'var(--surface)', borderRadius: 'var(--radius-md)'
                }}>
                  <span style={{ color: 'var(--accent-cyan)', fontSize: '0.875rem', marginTop: 2 }}>💡</span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{insight}</p>
                </div>
              ))}
              {aiInsight.tips?.length > 0 && (
                <div style={{ marginTop: 'var(--space-sm)' }}>
                  {aiInsight.tips.map((tip, i) => (
                    <p key={i} style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: 4 }}>
                      ✨ {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🤖</div>
              <h3>AI Insights</h3>
              <p>Add more transactions for personalized AI spending insights</p>
              <Link to="/assistant" className="btn btn-secondary" style={{ marginTop: 'var(--space-md)' }}>
                Chat with AI
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
