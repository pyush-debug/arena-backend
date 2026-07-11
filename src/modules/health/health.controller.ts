import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      version: '1.0.0', // Read from package.json in production
      timestamp: new Date().toISOString(),
    };
  }
}
