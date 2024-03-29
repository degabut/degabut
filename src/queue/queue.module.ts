import { HistoryModule } from "@history/history.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PlaylistModule } from "@playlist/playlist.module";
import { SpotifyModule } from "@spotify/spotify.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Listeners } from "./listeners";
import { Queries } from "./queries";
import { QueueRepository } from "./repositories";
import { QueueService } from "./services";

@Module({
  imports: [
    CqrsModule,
    HistoryModule,
    MediaSourceModule,
    YoutubeModule,
    SpotifyModule,
    PlaylistModule,
  ],
  providers: [QueueRepository, QueueService, ...Commands, ...Queries, ...Listeners],
  exports: [QueueRepository],
})
export class QueueModule {}
