import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(userId: string, filters: TransactionFilterDto) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = { contains: filters.category, mode: 'insensitive' };
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transaction deleted' };
  }

  async getCategoryStats(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
    });

    const stats: Record<string, { income: number; expense: number }> = {};
    for (const tx of transactions) {
      if (!stats[tx.category]) stats[tx.category] = { income: 0, expense: 0 };
      if (tx.type === 'INCOME') stats[tx.category].income += tx.amount;
      else stats[tx.category].expense += tx.amount;
    }

    return Object.entries(stats).map(([category, amounts]) => ({ category, ...amounts }));
  }

  async getMonthlyTrend(userId: string) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const txs = await this.prisma.transaction.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
      });

      const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

      months.push({
        month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income,
        expense,
        net: income - expense,
      });
    }
    return months;
  }
}
