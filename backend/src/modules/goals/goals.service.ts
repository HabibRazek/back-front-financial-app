import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { IsString, IsNumber, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { GoalStatus } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty({ example: 'Emergency Fund' })
  @IsString()
  name: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  currentAmount?: number;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional({ enum: GoalStatus, example: 'COMPLETED' })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount || 0,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map(g => ({
      ...g,
      percentage: Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100),
      remaining: Math.max(g.targetAmount - g.currentAmount, 0),
    }));
  }

  async contribute(userId: string, id: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    const status = newAmount >= goal.targetAmount ? 'COMPLETED' : 'ACTIVE';

    return this.prisma.goal.update({
      where: { id },
      data: { currentAmount: newAmount, status: status as GoalStatus },
    });
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    return this.prisma.goal.update({
      where: { id },
      data: { ...dto, deadline: dto.deadline ? new Date(dto.deadline) : undefined },
    });
  }

  async remove(userId: string, id: string) {
    const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    await this.prisma.goal.delete({ where: { id } });
    return { message: 'Goal deleted' };
  }
}
