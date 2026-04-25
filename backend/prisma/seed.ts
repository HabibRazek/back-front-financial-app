import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo user
  const hash = await bcrypt.hash('Demo1234!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@financeos.tn' },
    update: {},
    create: { email: 'demo@financeos.tn', name: 'Demo User', passwordHash: hash, currency: 'TND' },
  });

  console.log('✅ User created:', user.email);

  // Transactions — last 3 months
  const now = new Date();
  const txData = [];
  for (let m = 2; m >= 0; m--) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
    txData.push(
      { userId: user.id, type: 'INCOME' as const, amount: 3200, category: 'Salary', description: 'Monthly salary', date },
      { userId: user.id, type: 'EXPENSE' as const, amount: 850, category: 'Housing', description: 'Rent', date: new Date(date.setDate(1)) },
      { userId: user.id, type: 'EXPENSE' as const, amount: 320, category: 'Food', description: 'Groceries', date: new Date(date.setDate(10)) },
      { userId: user.id, type: 'EXPENSE' as const, amount: 80, category: 'Transport', description: 'Metro card', date: new Date(date.setDate(5)) },
      { userId: user.id, type: 'EXPENSE' as const, amount: 200, category: 'Shopping', description: 'Clothes', date: new Date(date.setDate(20)) },
      { userId: user.id, type: 'INCOME' as const, amount: 500, category: 'Freelance', description: 'Side project', date: new Date(date.setDate(25)) },
    );
  }

  for (const tx of txData) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`✅ ${txData.length} transactions created`);

  // Budgets for current month
  const budgets = [
    { userId: user.id, category: 'Food', limit: 400, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: user.id, category: 'Transport', limit: 150, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: user.id, category: 'Shopping', limit: 300, month: now.getMonth() + 1, year: now.getFullYear() },
    { userId: user.id, category: 'Entertainment', limit: 100, month: now.getMonth() + 1, year: now.getFullYear() },
  ];
  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { userId_category_month_year: { userId: b.userId, category: b.category, month: b.month, year: b.year } },
      update: {},
      create: b,
    });
  }
  console.log(`✅ ${budgets.length} budgets created`);

  // Goals
  const goals = [
    { userId: user.id, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3200, deadline: new Date('2024-12-31') },
    { userId: user.id, name: 'New Laptop', targetAmount: 2500, currentAmount: 800 },
    { userId: user.id, name: 'Vacation Fund', targetAmount: 5000, currentAmount: 1500, deadline: new Date('2024-08-01') },
  ];
  for (const g of goals) {
    await prisma.goal.create({ data: g });
  }
  console.log(`✅ ${goals.length} goals created`);

  console.log('\n🎉 Seed complete! Login: demo@financeos.tn / Demo1234!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
