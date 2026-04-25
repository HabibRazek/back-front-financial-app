import { Controller, Get } from '@nestjs/common';
import { Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry;
  private readonly httpRequestCounter: client.Counter;
  private readonly httpRequestDuration: client.Histogram;

  constructor() {
    this.registry = new client.Registry();
    client.collectDefaultMetrics({ register: this.registry });

    this.httpRequestCounter = new client.Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  incrementRequest(method: string, path: string, status: number) {
    this.httpRequestCounter.labels(method, path, String(status)).inc();
  }

  observeDuration(method: string, path: string, duration: number) {
    this.httpRequestDuration.labels(method, path).observe(duration);
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getContentType() {
    return this.registry.contentType;
  }
}

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private service: MetricsService) {}

  @Get()
  async getMetrics() {
    return this.service.getMetrics();
  }
}

@Module({
  providers: [MetricsService],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}
