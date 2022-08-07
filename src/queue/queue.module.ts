import { DiscordBotModule } from "@discord-bot/discord-bot.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Listeners } from "./listeners";
import { Queries } from "./queries";
import { QueueRepository } from "./repositories";
import { QueueService } from "./services";

@Module({
  imports: [CqrsModule, YoutubeModule, DiscordBotModule],
  providers: [QueueRepository, QueueService, ...Commands, ...Queries, ...Listeners],
})
export class QueueModule {}
