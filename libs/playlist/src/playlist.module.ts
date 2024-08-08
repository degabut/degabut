import { DatabaseModule } from "@database/database.module";
import { MediaSourceModule } from "@media-source/media-source.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { Commands } from "./commands";
import { Queries } from "./queries";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "./repositories";

@Module({
  imports: [CqrsModule, DatabaseModule, MediaSourceModule],
  providers: [PlaylistRepository, PlaylistMediaSourceRepository, ...Commands, ...Queries],
  exports: [PlaylistRepository, PlaylistMediaSourceRepository],
})
export class PlaylistModule {}
