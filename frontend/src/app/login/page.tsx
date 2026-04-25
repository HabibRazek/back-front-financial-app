'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-4">
            <TrendingUp className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your FinanceOS account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            No account?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
