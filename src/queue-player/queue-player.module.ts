import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { QueuePlayerConfigModule } from "./config";
import { Listeners } from "./listeners";
import { Queries } from "./queries";
import { QueuePlayerGateway } from "./queue-player.gateway";
import { QueuePlayerRepository } from "./repositories";
import { QueuePlayerService } from "./services";

@Module({
  imports: [CqrsModule, DiscordBotModule, ConfigModule, QueuePlayerConfigModule, YoutubeModule],
  providers: [
    QueuePlayerService,
    QueuePlayerRepository,
    QueuePlayerGateway,
    ...Commands,
    ...Queries,
    ...Listeners,
  ],
  exports: [QueuePlayerService],
})
export class QueuePlayerModule {}
