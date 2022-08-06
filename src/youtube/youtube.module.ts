import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { YoutubeiProvider } from "./providers";
import { Queries } from "./queries";
import { ChannelRepository, UserPlayHistoryRepository, VideoRepository } from "./repositories";

@Module({
  imports: [DatabaseModule],
  providers: [
    YoutubeiProvider,
    VideoRepository,
    ChannelRepository,
    UserPlayHistoryRepository,
    ...Queries,
  ],
  exports: [YoutubeiProvider, VideoRepository, ChannelRepository, UserPlayHistoryRepository],
})
export class YoutubeModule {}
