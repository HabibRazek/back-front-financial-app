import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
    });

    return this.signToken(user.id, user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.name);
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, currency: true, createdAt: true },
    });
  }

  private signToken(userId: string, email: string, name: string) {
    const payload = { sub: userId, email, name };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: userId, email, name },
    };
  }
}
