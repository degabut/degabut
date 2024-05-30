import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";
import { SpotifyModule } from "@spotify/spotify.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { MediaSourceRepository } from "./repositories";
import { MediaSourceService } from "./services";

@Module({
  imports: [DatabaseModule, YoutubeModule, SpotifyModule],
  providers: [MediaSourceRepository, MediaSourceService],
  exports: [MediaSourceRepository, MediaSourceService],
})
export class MediaSourceModule {}
