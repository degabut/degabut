import { ValidateParams } from "@common/decorators";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlaylistDto } from "@playlist/dtos";
import { PlaylistRepository } from "@playlist/repositories";

import { GetPlaylistParamSchema, GetPlaylistQuery, GetPlaylistResult } from "./get-playlist.query";

@QueryHandler(GetPlaylistQuery)
export class GetPlaylistHandler implements IInferredQueryHandler<GetPlaylistQuery> {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  @ValidateParams(GetPlaylistParamSchema)
  public async execute(params: GetPlaylistQuery): Promise<GetPlaylistResult> {
    const playlist = await this.playlistRepository.getById(params.playlistId);
    if (!playlist) throw new NotFoundException("Playlist not found");
    if (playlist.ownerId !== params.executor.id)
      throw new ForbiddenException("Missing permissions");

    return PlaylistDto.create(playlist);
  }
}
