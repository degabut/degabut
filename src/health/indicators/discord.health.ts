import { InjectDiscordClient } from "@discord-nestjs/core";
import { Injectable } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Client } from "discord.js";

@Injectable()
export class DiscordHealthIndicator extends HealthIndicator {
  constructor(@InjectDiscordClient() private readonly client: Client) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isReady = this.client.isReady();

    return this.getStatus("discord", isReady);
  }
}
