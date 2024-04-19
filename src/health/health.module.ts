import { DatabaseModule } from "@database/database.module";
import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthService } from "./health.service";
import {
  DatabaseHealthIndicator,
  DiscordHealthIndicator,
  LavalinkHealthIndicator,
} from "./indicators";

@Module({
  imports: [TerminusModule, DatabaseModule, DiscordBotModule],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    DiscordHealthIndicator,
    LavalinkHealthIndicator,
  ],
  exports: [HealthService],
})
export class HealthModule {}
