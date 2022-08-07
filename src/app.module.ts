import { ApiModule } from "@api/api.module";
import { AuthModule } from "@auth/auth.module";
import { DatabaseModule } from "@database/database.module";
import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { Module } from "@nestjs/common";
import { QueueModule } from "@queue/queue.module";

@Module({
  imports: [DatabaseModule, AuthModule, QueueModule, DiscordBotModule, ApiModule],
})
export class AppModule {}
