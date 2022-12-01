import {
  DatabaseHealthIndicator,
  DiscordHealthIndicator,
  LavalinkHealthIndicator,
} from "@health/indicators";
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHealthIndicator: DatabaseHealthIndicator,
    private readonly discordHealthIndicator: DiscordHealthIndicator,
    private readonly lavalinkHealthIndicator: LavalinkHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  getHealth() {
    return this.health.check([
      () => this.dbHealthIndicator.isHealthy(),
      () => this.discordHealthIndicator.isHealthy(),
      () => this.lavalinkHealthIndicator.isHealthy(),
    ]);
  }
}
