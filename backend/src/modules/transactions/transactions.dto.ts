import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Food' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Grocery shopping' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}

export class TransactionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
