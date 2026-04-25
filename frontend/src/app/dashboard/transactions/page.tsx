'use client';
import { useEffect, useState, useCallback } from 'react';
import { transactionsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Salary', 'Freelance', 'Investment', 'Other'];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(n);
}

interface TxFormProps {
  initial?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

function TxForm({ initial, onSave, onCancel }: TxFormProps) {
  const [form, setForm] = useState({
    amount: initial?.amount || '',
    type: initial?.type || 'EXPENSE',
    category: initial?.category || 'Food',
    description: initial?.description || '',
    date: initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount as string) });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Amount (TND)</label>
          <input type="number" step="0.01" required value={form.amount} onChange={set('amount')} className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
          <select value={form.type} onChange={set('type')} className="input">
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <select value={form.category} onChange={set('category')} className="input">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Date</label>
          <input type="date" value={form.date} onChange={set('date')} className="input" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Description (optional)</label>
        <input type="text" value={form.description} onChange={set('description')} className="input" placeholder="What was this for?" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving…' : initial ? 'Update' : 'Add Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
      </div>
    </form>
  );
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await transactionsApi.list({
        page, limit: 15,
        ...(typeFilter && { type: typeFilter }),
        ...(search && { category: search }),
      });
      setTxs(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: any) => {
    if (editing) await transactionsApi.update(editing.id, data);
    else await transactionsApi.create(data);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await transactionsApi.delete(id);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{meta.total || 0} total records</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Form modal */}
      {(showForm || editing) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-slide-up">
            <h2 className="font-semibold text-white mb-4">{editing ? 'Edit Transaction' : 'New Transaction'}</h2>
            <TxForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search category…" className="input pl-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input w-40">
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2f45]">
                {['Type', 'Category', 'Description', 'Amount', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2f45]">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : txs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No transactions found</td></tr>
              ) : txs.map(tx => (
                <tr key={tx.id} className="hover:bg-[#22263a] transition-colors">
                  <td className="px-4 py-3">
                    <span className={tx.type === 'INCOME' ? 'badge-income' : 'badge-expense'}>
                      {tx.type === 'INCOME' ? <ArrowUpRight className="w-3 h-3 inline mr-1" /> : <ArrowDownRight className="w-3 h-3 inline mr-1" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{tx.category}</td>
                  <td className="px-4 py-3 text-sm text-slate-400 max-w-[180px] truncate">{tx.description || '—'}</td>
                  <td className={clsx('px-4 py-3 text-sm font-semibold', tx.type === 'INCOME' ? 'text-primary-400' : 'text-red-400')}>
                    {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(tx)} className="p-1.5 rounded-lg hover:bg-[#2a2f45] text-slate-400 hover:text-white transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2f45]">
            <span className="text-xs text-slate-500">Page {page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">← Prev</button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
