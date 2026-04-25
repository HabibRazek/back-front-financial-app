import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../config/prisma.service';

const mockPrisma = {
  transaction: {
    findMany: jest.fn(),
  },
  budget: {
    findMany: jest.fn(),
  },
  goal: {
    findMany: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return summary with zeroes when no data', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.budget.findMany.mockResolvedValue([]);
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123');

      expect(result.totalBalance).toBe(0);
      expect(result.monthIncome).toBe(0);
      expect(result.monthExpense).toBe(0);
      expect(result.savingsRate).toBe(0);
    });

    it('should calculate savings rate correctly', async () => {
      const now = new Date();
      const transactions = [
        { id: '1', type: 'INCOME', amount: 1000, category: 'Salary', date: now },
        { id: '2', type: 'EXPENSE', amount: 400, category: 'Food', date: now },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(transactions);
      mockPrisma.budget.findMany.mockResolvedValue([]);
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123');

      expect(result.savingsRate).toBe(60); // (1000-400)/1000 * 100
      expect(result.monthIncome).toBe(1000);
      expect(result.monthExpense).toBe(400);
    });
  });
});
