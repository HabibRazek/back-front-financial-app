import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService, CreateGoalDto, UpdateGoalDto } from './goals.service';

class ContributeDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  amount: number;
}

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private service: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a savings goal' })
  create(@Request() req, @Body() dto: CreateGoalDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all goals' })
  findAll(@Request() req) {
    return this.service.findAll(req.user.userId);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add contribution to goal' })
  @ApiBody({ type: ContributeDto })
  contribute(@Request() req, @Param('id') id: string, @Body() body: ContributeDto) {
    return this.service.contribute(req.user.userId, id, body.amount);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
