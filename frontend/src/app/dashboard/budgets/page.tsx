'use client';
import { useEffect, useState } from 'react';
import { budgetsApi } from '@/lib/api';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Other'];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(n);
}

export default function BudgetsPage() {
  const now = new Date();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'Food', limit: '', month: now.getMonth() + 1, year: now.getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await budgetsApi.list(now.getMonth() + 1, now.getFullYear());
      setBudgets(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await budgetsApi.create({ ...form, limit: parseFloat(form.limit) });
      setShowForm(false);
      setForm({ category: 'Food', limit: '', month: now.getMonth() + 1, year: now.getFullYear() });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create budget');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await budgetsApi.delete(id);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm animate-slide-up">
            <h2 className="font-semibold text-white mb-4">Set Budget</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Monthly Limit (TND)</label>
                <input type="number" required step="0.01" value={form.limit}
                  onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} className="input" placeholder="500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400">No budgets set for this month.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Create your first budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const over = b.percentage > 100;
            const warn = b.percentage >= 80 && !over;
            return (
              <div key={b.id} className={clsx('card', over && 'border-red-500/30', warn && 'border-amber-500/20')}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{b.category}</span>
                    {over && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {!over && b.percentage < 60 && <CheckCircle className="w-4 h-4 text-primary-400" />}
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Spent: <span className="text-white font-medium">{fmt(b.spent)}</span></span>
                  <span className="text-slate-400">Limit: <span className="text-white font-medium">{fmt(b.limit)}</span></span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#22263a] rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-500',
                      over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-primary-500')}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span className={clsx(over ? 'text-red-400' : warn ? 'text-amber-400' : 'text-primary-400')}>
                    {b.percentage}%
                  </span>
                  <span className={clsx(over ? 'text-red-400' : 'text-slate-500')}>
                    {over ? `${fmt(Math.abs(b.remaining))} over` : `${fmt(b.remaining)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
