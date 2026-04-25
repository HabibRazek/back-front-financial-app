import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthTxs, allTxs, budgets, goals, recentTxs] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      this.prisma.transaction.findMany({ where: { userId } }),
      this.prisma.budget.findMany({
        where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
      }),
      this.prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } }),
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const monthIncome = monthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const totalBalance = allTxs.reduce((s, t) => t.type === 'INCOME' ? s + t.amount : s - t.amount, 0);
    const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

    // Budget alerts — over 80%
    const spendingByCategory: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'EXPENSE').forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });

    const budgetAlerts = budgets
      .map(b => ({
        ...b,
        spent: spendingByCategory[b.category] || 0,
        percentage: Math.round(((spendingByCategory[b.category] || 0) / b.limit) * 100),
      }))
      .filter(b => b.percentage >= 80);

    return {
      totalBalance,
      monthIncome,
      monthExpense,
      savingsRate,
      activeGoals: goals.length,
      budgetAlerts,
      recentTransactions: recentTxs,
    };
  }
}
