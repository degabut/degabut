import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
import { YoutubeiProvider } from "./providers";
import { Queries } from "./queries";
import { ChannelRepository, VideoRepository } from "./repositories";
import { YoutubeService } from "./services";

@Module({
  imports: [DatabaseModule],
  providers: [
    YoutubeiProvider,
    VideoRepository,
    ChannelRepository,
    YoutubeService,
    ...Queries,
    ...Listeners,
  ],
  exports: [YoutubeiProvider, YoutubeService, VideoRepository, ChannelRepository],
})
export class YoutubeModule {}
