import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Client } from "discord.js";

@Injectable()
export class DiscordHealthIndicator extends HealthIndicator {
  constructor(@InjectDiscordClient() private readonly client: Client) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isReady = this.client.isReady();

    if (isReady) return this.getStatus("discord", true);
    throw new HealthCheckError("Discord health check failed", isReady);
  }
}
