import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from './transactions.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  create(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  findAll(@Request() req, @Query() filters: TransactionFilterDto) {
    return this.service.findAll(req.user.userId, filters);
  }

  @Get('stats/categories')
  @ApiOperation({ summary: 'Category breakdown for a month' })
  categoryStats(@Request() req, @Query('month') month: string, @Query('year') year: string) {
    return this.service.getCategoryStats(req.user.userId, +month, +year);
  }

  @Get('stats/trend')
  @ApiOperation({ summary: '6-month income/expense trend' })
  trend(@Request() req) {
    return this.service.getMonthlyTrend(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
