import { ValidateParams } from "@common/decorators";
import { LyricsSources } from "@lyrics/lyrics.constants";
import { LyricsService } from "@lyrics/services";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { LyricsDto } from "@queue/dtos";
import { QueueRepository } from "@queue/repositories";

import {
  GetNowPlayingLyricsParamSchema,
  GetNowPlayingLyricsQuery,
  GetNowPlayingLyricsResult,
} from "./get-now-playing-lyrics.query";

@QueryHandler(GetNowPlayingLyricsQuery)
export class GetNowPlayingLyricsHandler implements IInferredQueryHandler<GetNowPlayingLyricsQuery> {
  constructor(
    private readonly queueRepository: QueueRepository,
    private readonly lyricsService: LyricsService,
  ) {}

  @ValidateParams(GetNowPlayingLyricsParamSchema)
  public async execute(params: GetNowPlayingLyricsQuery): Promise<GetNowPlayingLyricsResult> {
    const queue = params.voiceChannelId
      ? this.queueRepository.getByVoiceChannelId(params.voiceChannelId)
      : this.queueRepository.getByUserId(params.executor.id);
    if (!queue) throw new NotFoundException("Queue not found");
    if (!queue.getMember(params.executor.id)) throw new ForbiddenException("Missing permissions");

    if (!queue.nowPlaying) throw new NotFoundException("No song is currently playing");

    const sources = [LyricsSources.Lrclib, LyricsSources.Musixmatch];

    const lyrics = await Promise.all(
      sources.map((s) => this.lyricsService.getLyrics(s, queue.nowPlaying!.mediaSource)),
    );

    return sources.reduce<LyricsDto[]>((prev, curr, i) => {
      const lyricsForSource = lyrics.at(i);
      if (!lyricsForSource) return prev;
      prev.push({ source: curr, ...lyricsForSource });
      return prev;
    }, []);
  }
}
