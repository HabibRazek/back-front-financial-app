'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  TrendingUp, LogOut, Settings, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/dashboard/budgets', label: 'Budgets', icon: PieChart },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#1a1d27] border-r border-[#2a2f45]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#2a2f45]">
        <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-400" />
        </div>
        <span className="font-bold text-white text-lg">FinanceOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                  : 'text-slate-400 hover:bg-[#22263a] hover:text-white'
              )}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-[#2a2f45] pt-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/10 w-full transition-all duration-200">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
