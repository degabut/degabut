import { HistoryModule } from "@history/history.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PlaylistModule } from "@playlist/playlist.module";
import { UserModule } from "@user/user.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Listeners } from "./listeners";
import { Queries } from "./queries";
import { QueueRepository } from "./repositories";

@Module({
  imports: [
    CqrsModule,
    YoutubeModule,
    MediaSourceModule,
    PlaylistModule,
    HistoryModule,
    UserModule,
    YoutubeModule,
  ],
  providers: [QueueRepository, ...Commands, ...Queries, ...Listeners],
  exports: [QueueRepository],
})
export class QueueModule {}
