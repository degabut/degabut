import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Client } from "discord.js";

@Injectable()
export class LavalinkHealthIndicator extends HealthIndicator {
  constructor(@InjectDiscordClient() private readonly client: Client) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isConnected = this.client.lavalink.state === 2;
    return this.getStatus("lavalink", isConnected);
  }
}
