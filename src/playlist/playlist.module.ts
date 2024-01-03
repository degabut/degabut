import { DatabaseModule } from "@database/database.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module } from "@nestjs/common";
import { SpotifyModule } from "@spotify/spotify.module";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "./repositories";

@Module({
  imports: [DatabaseModule, MediaSourceModule, YoutubeModule, SpotifyModule],
  providers: [PlaylistRepository, PlaylistMediaSourceRepository, ...Commands, ...Queries],
  exports: [PlaylistRepository, PlaylistMediaSourceRepository],
})
export class PlaylistModule {}
