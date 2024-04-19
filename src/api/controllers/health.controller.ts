import { HealthService } from "@health/health.service";
import { Controller, Get } from "@nestjs/common";
import { HealthCheck } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  getHealth() {
    return this.healthService.getHealth();
  }
}
