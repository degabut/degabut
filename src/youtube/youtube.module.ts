import { DatabaseModule } from "@database/database.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { Listeners } from "./listeners";
import { YoutubeEmbedProvider, YoutubeiProvider } from "./providers";
import { ChannelRepository, VideoRepository } from "./repositories";
import { YoutubeCachedService } from "./services";

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [
    YoutubeiProvider,
    YoutubeEmbedProvider,
    VideoRepository,
    ChannelRepository,
    YoutubeCachedService,
    ...Listeners,
  ],
  exports: [YoutubeiProvider, YoutubeCachedService, VideoRepository, ChannelRepository],
})
export class YoutubeModule {}
