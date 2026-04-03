import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '../utils/helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { HiOutlineChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAnalytics();
  }, [month, year]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await transactionAPI.getAnalytics({ month, year });
      setAnalytics(data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  const categoryData = analytics?.categoryBreakdown?.map(c => ({
    name: c._id,
    value: c.total,
    count: c.count,
    fill: getCategoryColor(c._id)
  })) || [];

  const paymentData = analytics?.paymentBreakdown?.map(p => ({
    name: p._id,
    value: p.total,
    count: p.count
  })) || [];

  const dailyData = analytics?.dailyTrend?.map(d => ({
    day: `Day ${d._id}`,
    expense: d.expense,
    income: d.income
  })) || [];

  const budgetData = analytics?.budgetComparison || [];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Analytics</h1>
          <p>Deep-dive into your spending patterns</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <select className="input" value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: 120 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="input" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 100 }}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="glass stat-card green">
          <span className="stat-label">Total Income</span>
          <span className="stat-value">{formatCurrency(analytics?.totalIncome || 0)}</span>
        </div>
        <div className="glass stat-card pink">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">{formatCurrency(analytics?.totalExpense || 0)}</span>
        </div>
        <div className="glass stat-card cyan">
          <span className="stat-label">Net Balance</span>
          <span className="stat-value" style={{ color: (analytics?.balance || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {formatCurrency(analytics?.balance || 0)}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Daily Trend */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Daily Spending Trend</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#5a5e7d" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5a5e7d" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#121738', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="expense" fill="#f472b6" radius={[4, 4, 0, 0]} name="Expense" />
                <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Income" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>No data for this period</p></div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#121738', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'var(--space-md)' }}>
                {categoryData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.8125rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.fill, flexShrink: 0 }}></span>
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{getCategoryIcon(c.name)} {c.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(c.value)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({c.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>No expenses this period</p></div>
          )}
        </div>
      </div>

      {/* Payment Methods & Budget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Payment Methods */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Payment Methods</h3>
          {paymentData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {paymentData.map((p, i) => {
                const pct = analytics?.totalExpense ? Math.round((p.value / analytics.totalExpense) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(p.value)} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'var(--gradient-brand)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state"><p style={{ color: 'var(--text-muted)' }}>No data available</p></div>
          )}
        </div>

        {/* Budget Tracking */}
        <div className="glass animate-in" style={{ padding: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Budget Tracking</h3>
          {budgetData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {budgetData.map((b, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{getCategoryIcon(b.category)} {b.category}</span>
                    <span style={{ fontWeight: 600, color: b.percentage > 100 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min(100, b.percentage)}%`,
                      background: b.percentage > 100 ? 'var(--gradient-danger)' : b.percentage > 80 ? 'var(--accent-orange)' : 'var(--gradient-success)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <div className="empty-icon">📊</div>
              <h3>No budgets set</h3>
              <p>Go to Settings to set category-wise budgets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
