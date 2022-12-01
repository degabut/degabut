import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Client } from "discord.js";

@Injectable()
export class LavalinkHealthIndicator extends HealthIndicator {
  constructor(@InjectDiscordClient() private readonly client: Client) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isConnected = this.client.lavalink.state === 2;

    if (isConnected) return this.getStatus("lavalink", true);
    throw new HealthCheckError("Lavalink health check failed", this.client.lavalink.state);
  }
}
