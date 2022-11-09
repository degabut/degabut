import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlaylistDto } from "@playlist/dtos";
import { PlaylistRepository } from "@playlist/repositories";

import {
  GetPlaylistsParamSchema,
  GetPlaylistsQuery,
  GetPlaylistsResult,
} from "./get-playlists.query";

@QueryHandler(GetPlaylistsQuery)
export class GetPlaylistsHandler implements IInferredQueryHandler<GetPlaylistsQuery> {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  @ValidateParams(GetPlaylistsParamSchema)
  public async execute(params: GetPlaylistsQuery): Promise<GetPlaylistsResult> {
    const playlist = await this.playlistRepository.getByUserId(params.executor.id);

    return playlist.map(PlaylistDto.create);
  }
}
