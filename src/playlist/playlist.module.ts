import { DatabaseModule } from "@database/database.module";
import { Module } from "@nestjs/common";
import { YoutubeModule } from "@youtube/youtube.module";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { PlaylistRepository, PlaylistVideoRepository } from "./repositories";

@Module({
  imports: [DatabaseModule, YoutubeModule],
  providers: [PlaylistRepository, PlaylistVideoRepository, ...Commands, ...Queries],
})
export class PlaylistModule {}
