import { Injectable } from "@nestjs/common";
import { HealthCheckService } from "@nestjs/terminus";

import {
  DatabaseHealthIndicator,
  DiscordHealthIndicator,
  LavalinkHealthIndicator,
} from "./indicators";

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHealthIndicator: DatabaseHealthIndicator,
    private readonly discordHealthIndicator: DiscordHealthIndicator,
    private readonly lavalinkHealthIndicator: LavalinkHealthIndicator,
  ) {}

  getHealth() {
    return this.health.check([
      () => this.dbHealthIndicator.isHealthy(),
      () => this.discordHealthIndicator.isHealthy(),
      () => this.lavalinkHealthIndicator.isHealthy(),
    ]);
  }
}
