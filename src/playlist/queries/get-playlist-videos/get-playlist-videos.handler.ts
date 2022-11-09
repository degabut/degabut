import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlaylistVideoDto } from "@playlist/dtos/playlist-video.dto";
import { PlaylistRepository, PlaylistVideoRepository } from "@playlist/repositories";
import { VideoRepository } from "@youtube/repositories";

import {
  GetPlaylistVideosParamSchema,
  GetPlaylistVideosQuery,
  GetPlaylistVideosResult,
} from "./get-playlist-videos.query";

@QueryHandler(GetPlaylistVideosQuery)
export class GetPlaylistVideosHandler implements IInferredQueryHandler<GetPlaylistVideosQuery> {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistVideoRepository: PlaylistVideoRepository,
    private readonly videoRepository: VideoRepository,
  ) {}

  @ValidateParams(GetPlaylistVideosParamSchema)
  public async execute(params: GetPlaylistVideosQuery): Promise<GetPlaylistVideosResult> {
    const playlist = await this.playlistRepository.getById(params.playlistId);
    if (!playlist) throw new NotFoundException("Playlist not found");
    if (playlist.ownerId !== params.executor.id)
      throw new ForbiddenException("Missing permissions");

    const playlistVideos = await this.playlistVideoRepository.getByPlaylistId(params.playlistId);

    return playlistVideos.map(PlaylistVideoDto.create);
  }
}
