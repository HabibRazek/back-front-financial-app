import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com' });

      await expect(
        service.register({ name: 'Test', email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', email: 'test@test.com', name: 'Test' });

      const result = await service.register({ name: 'Test', email: 'test@test.com', password: 'password123' });

      expect(result.access_token).toBe('mocked.jwt.token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@user.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'test@test.com', name: 'Test', passwordHash: hash,
      });

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result.access_token).toBe('mocked.jwt.token');
    });
  });
});
