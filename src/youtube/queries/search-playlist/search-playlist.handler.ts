import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PlaylistCompactDto } from "@youtube/dtos";
import { YoutubeiProvider } from "@youtube/providers";

import {
  SearchPlaylistParamSchema,
  SearchPlaylistQuery,
  SearchPlaylistResult,
} from "./search-playlist.query";

@QueryHandler(SearchPlaylistQuery)
export class SearchPlaylistHandler implements IInferredQueryHandler<SearchPlaylistQuery> {
  constructor(private readonly youtubeiProvider: YoutubeiProvider) {}

  @ValidateParams(SearchPlaylistParamSchema)
  public async execute(params: SearchPlaylistQuery): Promise<SearchPlaylistResult> {
    const playlists = await this.youtubeiProvider.searchPlaylist(params.keyword);
    return playlists.map(PlaylistCompactDto.create);
  }
}
