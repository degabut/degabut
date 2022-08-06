import { ApiModule } from "@api/api.module";
import { DatabaseModule } from "@database/database.module";
import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { DiscordModule } from "@discord/discord.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";

@Module({
  imports: [DatabaseModule, DiscordModule, QueueModule, DiscordBotModule, ApiModule],
})
export class AppModule {}
