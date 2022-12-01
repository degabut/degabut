import { DatabaseModule } from "@database/database.module";
import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./health.controller";
import {
  DatabaseHealthIndicator,
  DiscordHealthIndicator,
  LavalinkHealthIndicator,
} from "./indicators";

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, DatabaseModule, DiscordBotModule],
  providers: [DatabaseHealthIndicator, DiscordHealthIndicator, LavalinkHealthIndicator],
})
export class HealthModule {}
