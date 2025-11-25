import { DatabaseModule } from "@database/database.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { LrclibLyricsProvider } from "./providers";
import { MusixmatchLyricsProvider } from "./providers/musixmatch-lyrics.provider";
import { LyricsRepository } from "./repositories";
import { LyricsService } from "./services/lyrics.service";

@Module({
  imports: [DatabaseModule, HttpModule.register({ validateStatus: () => true })],
  providers: [MusixmatchLyricsProvider, LrclibLyricsProvider, LyricsRepository, LyricsService],
  exports: [LyricsService],
})
export class LyricsModule {}
