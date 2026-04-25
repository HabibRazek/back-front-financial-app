'use client';
import { useEffect, useState } from 'react';
import { dashboardApi, transactionsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/ui/StatCard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, Target, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import Link from 'next/link';

const CATEGORY_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary(),
      transactionsApi.trend(),
      transactionsApi.categoryStats(),
    ]).then(([s, t, c]) => {
      setSummary(s.data);
      setTrend(t.data);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-0.5">Here's your financial overview</p>
        </div>
        <Link href="/dashboard/transactions?new=1" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Transaction
        </Link>
      </div>

      {/* Budget Alerts */}
      {summary?.budgetAlerts?.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Budget Alert</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              {summary.budgetAlerts.map((b: any) => `${b.category} (${b.percentage}%)`).join(', ')} — approaching limit
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={fmt(summary?.totalBalance || 0)} icon={Wallet}
          variant="neutral" subtitle="All time net" />
        <StatCard title="Income (Month)" value={fmt(summary?.monthIncome || 0)} icon={TrendingUp}
          variant="income" subtitle="This month" />
        <StatCard title="Expenses (Month)" value={fmt(summary?.monthExpense || 0)} icon={TrendingDown}
          variant="expense" subtitle="This month" />
        <StatCard title="Savings Rate" value={`${summary?.savingsRate || 0}%`} icon={Target}
          variant="default" subtitle={`${summary?.activeGoals || 0} active goals`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-white mb-4">6-Month Cash Flow</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f45" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1d27', border: '1px solid #2a2f45', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v: any) => fmt(v)} />
              <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#gIncome)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#gExpense)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Spending by Category</h2>
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories.map(c => ({ name: c.category, value: c.expense }))}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {categories.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1d27', border: '1px solid #2a2f45', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v: any) => fmt(v)} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '11px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No expenses this month
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-xs text-primary-400 hover:text-primary-300">View all →</Link>
        </div>
        <div className="space-y-2">
          {summary?.recentTransactions?.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">No transactions yet</p>
          )}
          {summary?.recentTransactions?.map((tx: any) => (
            <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#22263a] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tx.type === 'INCOME' ? 'bg-primary-900/30' : 'bg-red-900/30'
              }`}>
                {tx.type === 'INCOME'
                  ? <ArrowUpRight className="w-4 h-4 text-primary-400" />
                  : <ArrowDownRight className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.description || tx.category}</p>
                <p className="text-xs text-slate-500">{tx.category} · {new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-primary-400' : 'text-red-400'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
