import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import { YoutubeiProvider } from "@youtube/providers";

import { SearchVideoParamSchema, SearchVideoQuery, SearchVideoResult } from "./search-video.query";

@QueryHandler(SearchVideoQuery)
export class SearchVideoHandler implements IInferredQueryHandler<SearchVideoQuery> {
  constructor(private readonly youtubeiProvider: YoutubeiProvider) {}

  @ValidateParams(SearchVideoParamSchema)
  public async execute(params: SearchVideoQuery): Promise<SearchVideoResult> {
    const videos = await this.youtubeiProvider.searchVideo(params.keyword);

    return videos.map(VideoCompactDto.create);
  }
}
