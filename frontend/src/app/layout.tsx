import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'FinanceOS — Smart Money Management',
  description: 'Track spending, set budgets, and reach your financial goals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
