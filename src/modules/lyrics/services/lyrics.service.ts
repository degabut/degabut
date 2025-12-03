import { Logger } from "@logger/logger.service";
import { LyricsSources } from "@lyrics/lyrics.constants";
import { ILyricsResponse, LrclibLyricsProvider, MusixmatchLyricsProvider } from "@lyrics/providers";
import { LyricsRepository } from "@lyrics/repositories";
import { MediaSource } from "@media-source/entities";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LyricsService {
  constructor(
    private readonly musixmatchProvider: MusixmatchLyricsProvider,
    private readonly lrclibProvider: LrclibLyricsProvider,
    private readonly lyricsRepository: LyricsRepository,
    private readonly logger: Logger,
  ) {}

  async getLyrics(
    source: LyricsSources,
    mediaSource: MediaSource,
  ): Promise<ILyricsResponse | null> {
    const { duration } = mediaSource;
    const creator = mediaSource.youtubeVideo?.musicMetadata?.artist || mediaSource.creator;
    const title = mediaSource.youtubeVideo?.musicMetadata?.title || mediaSource.title;

    // Check cache first
    const cachedLyrics = await this.lyricsRepository.findByMediaSourceIdAndSource(
      mediaSource.id,
      source,
    );

    if (cachedLyrics) {
      return {
        richSynced: cachedLyrics.richSynced,
        synced: cachedLyrics.synced,
        unsynced: cachedLyrics.unsynced,
        duration: cachedLyrics.duration,
        debugInfo: { cached: true, source },
      };
    }

    // Fetch from provider
    let lyrics: ILyricsResponse | null = null;

    try {
      switch (source) {
        case LyricsSources.Musixmatch:
          lyrics = await this.musixmatchProvider.getLyrics(creator, title, null);
          break;
        case LyricsSources.Lrclib:
          lyrics = await this.lrclibProvider.getLyrics(creator, title, null, duration);
          break;
        default:
          lyrics = null;
      }

      // Cache the result if lyrics were found
      if (lyrics && (lyrics.richSynced || lyrics.synced || lyrics.unsynced)) {
        await this.lyricsRepository.upsert({
          mediaSourceId: mediaSource.id,
          source: source,
          richSynced: lyrics.richSynced,
          synced: lyrics.synced,
          unsynced: lyrics.unsynced,
          duration: lyrics.duration,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return lyrics;
    } catch (error) {
      this.logger.error(`Error fetching lyrics from ${source} for ${mediaSource.id}:`, error);
      return null;
    }
  }
}
