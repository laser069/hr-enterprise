import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check() {
    return this.health.check([
      // Database health check
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error: any) {
          return {
            database: {
              status: 'down',
              message: error?.message || 'Database connection failed',
            },
          };
        }
      },
      // Memory health check (warn if > 150MB heap used)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Memory RSS check (warn if > 150MB RSS)
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      // Disk storage check (warn if < 250MB free)
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.75, path: '/' }),
    ]);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Readiness check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
