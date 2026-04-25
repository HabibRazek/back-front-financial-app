import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetsService, CreateBudgetDto, UpdateBudgetDto } from './budgets.service';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private service: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create budget for a category' })
  create(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get budgets with spending progress' })
  findAll(@Request() req, @Query('month') month: string, @Query('year') year: string) {
    return this.service.findAll(req.user.userId, +month, +year);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
