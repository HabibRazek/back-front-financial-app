'use client';
import { useEffect, useState } from 'react';
import { goalsApi } from '@/lib/api';
import { Plus, Trash2, Target, CheckCircle, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

function fmt(n: number) {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(n);
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contributing, setContributing] = useState<string | null>(null);
  const [contribution, setContribution] = useState('');
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await goalsApi.list();
      setGoals(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalsApi.create({
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: form.currentAmount ? parseFloat(form.currentAmount) : 0,
        deadline: form.deadline || undefined,
      });
      setShowForm(false);
      setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
      load();
    } finally { setSaving(false); }
  };

  const handleContribute = async (id: string) => {
    if (!contribution || parseFloat(contribution) <= 0) return;
    await goalsApi.contribute(id, parseFloat(contribution));
    setContributing(null);
    setContribution('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    await goalsApi.delete(id);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your financial milestones</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm animate-slide-up">
            <h2 className="font-semibold text-white mb-4">Create Goal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Goal name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input" placeholder="Emergency Fund" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Target (TND)</label>
                  <input type="number" required step="0.01" value={form.targetAmount}
                    onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                    className="input" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Already saved</label>
                  <input type="number" step="0.01" value={form.currentAmount}
                    onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                    className="input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Deadline (optional)</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Create Goal'}
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
      ) : goals.length === 0 ? (
        <div className="card text-center py-16">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No goals yet. Create your first savings goal!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Create Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => (
            <div key={g.id} className={clsx('card', g.status === 'COMPLETED' && 'border-primary-500/30 bg-primary-900/5')}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center',
                    g.status === 'COMPLETED' ? 'bg-primary-600/20' : 'bg-[#22263a]')}>
                    {g.status === 'COMPLETED'
                      ? <CheckCircle className="w-5 h-5 text-primary-400" />
                      : <Target className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{g.name}</h3>
                    {g.deadline && (
                      <p className="text-xs text-slate-500">Due: {new Date(g.deadline).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {g.status === 'ACTIVE' && (
                    <button onClick={() => setContributing(g.id)}
                      className="p-1.5 rounded-lg hover:bg-primary-900/20 text-slate-400 hover:text-primary-400 transition-colors">
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Saved: <span className="text-white font-medium">{fmt(g.currentAmount)}</span></span>
                <span className="text-slate-400">Goal: <span className="text-white font-medium">{fmt(g.targetAmount)}</span></span>
              </div>

              <div className="w-full h-2.5 bg-[#22263a] rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                  style={{ width: `${g.percentage}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-primary-400 font-medium">{g.percentage}%</span>
                <span className="text-slate-500">{fmt(g.remaining)} to go</span>
              </div>

              {/* Contribute inline */}
              {contributing === g.id && (
                <div className="mt-4 pt-4 border-t border-[#2a2f45] flex gap-2">
                  <input type="number" step="0.01" value={contribution}
                    onChange={e => setContribution(e.target.value)}
                    className="input flex-1 py-2" placeholder="Amount to add (TND)" />
                  <button onClick={() => handleContribute(g.id)} className="btn-primary px-4 py-2">Add</button>
                  <button onClick={() => setContributing(null)} className="btn-ghost px-3 py-2">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
