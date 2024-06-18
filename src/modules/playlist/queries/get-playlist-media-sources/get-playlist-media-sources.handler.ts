import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlaylistMediaSourceDto } from "@playlist/dtos";
import { PlaylistMediaSourceRepository, PlaylistRepository } from "@playlist/repositories";

import {
  GetPlaylistMediaSourcesParamSchema,
  GetPlaylistMediaSourcesQuery,
  GetPlaylistMediaSourcesResult,
} from "./get-playlist-media-sources.query";

@QueryHandler(GetPlaylistMediaSourcesQuery)
export class GetPlaylistMediaSourceHandler
  implements IInferredQueryHandler<GetPlaylistMediaSourcesQuery>
{
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly playlistMediaSourceRepository: PlaylistMediaSourceRepository,
  ) {}

  @ValidateParams(GetPlaylistMediaSourcesParamSchema)
  public async execute(
    params: GetPlaylistMediaSourcesQuery,
  ): Promise<GetPlaylistMediaSourcesResult> {
    const playlist = await this.playlistRepository.getById(params.playlistId);
    if (!playlist) throw new NotFoundException("Playlist not found");
    if (playlist.ownerId !== params.executor.id)
      throw new ForbiddenException("Missing permissions");

    const playlistMediaSources = await this.playlistMediaSourceRepository.getByPlaylistId(
      playlist.id,
      params,
    );

    return playlistMediaSources.map(PlaylistMediaSourceDto.create);
  }
}
