import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
import { YoutubeiProvider } from "./providers";
import { Queries } from "./queries";
import { ChannelRepository, VideoRepository } from "./repositories";

@Module({
  imports: [DatabaseModule],
  providers: [YoutubeiProvider, VideoRepository, ChannelRepository, ...Queries, ...Listeners],
  exports: [YoutubeiProvider, VideoRepository],
})
export class YoutubeModule {}
