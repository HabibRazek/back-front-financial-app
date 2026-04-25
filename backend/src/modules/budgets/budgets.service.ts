import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { IsString, IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  category: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  year: number;
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const exists = await this.prisma.budget.findUnique({
      where: { userId_category_month_year: { userId, category: dto.category, month: dto.month, year: dto.year } },
    });
    if (exists) throw new ConflictException('Budget already exists for this category/month');

    return this.prisma.budget.create({ data: { userId, ...dto } });
  }

  async findAll(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    const budgets = await this.prisma.budget.findMany({ where: { userId, month: m, year: y } });

    // Calculate spending per category
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const spending = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: { userId, type: 'EXPENSE', date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    });

    const spendingMap: Record<string, number> = {};
    spending.forEach(s => { spendingMap[s.category] = s._sum.amount || 0; });

    return budgets.map(b => ({
      ...b,
      spent: spendingMap[b.category] || 0,
      remaining: b.limit - (spendingMap[b.category] || 0),
      percentage: Math.round(((spendingMap[b.category] || 0) / b.limit) * 100),
    }));
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    return this.prisma.budget.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');
    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted' };
  }
}
