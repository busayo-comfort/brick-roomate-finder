import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '../decorators/allow-anonymous.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @AllowAnonymous()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}