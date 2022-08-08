import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
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
    ...Listeners,
  ],
  exports: [YoutubeiProvider],
})
export class YoutubeModule {}
