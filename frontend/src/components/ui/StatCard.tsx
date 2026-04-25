import clsx from 'clsx';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  variant?: 'default' | 'income' | 'expense' | 'neutral';
}

const variantStyles = {
  default: 'border-[#2a2f45]',
  income: 'border-primary-500/20 bg-primary-900/10',
  expense: 'border-red-500/20 bg-red-900/10',
  neutral: 'border-blue-500/20 bg-blue-900/10',
};

const iconStyles = {
  default: 'bg-[#22263a] text-slate-300',
  income: 'bg-primary-600/20 text-primary-400',
  expense: 'bg-red-600/20 text-red-400',
  neutral: 'bg-blue-600/20 text-blue-400',
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={clsx('card animate-slide-up', variantStyles[variant])}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={clsx('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend >= 0 ? 'bg-primary-900/30 text-primary-400' : 'bg-red-900/30 text-red-400')}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
