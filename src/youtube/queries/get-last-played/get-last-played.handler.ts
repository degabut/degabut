import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import { VideoRepository } from "@youtube/repositories";

import {
  GetLastPlayedParamSchema,
  GetLastPlayedQuery,
  GetLastPlayedResult,
} from "./get-last-played.query";

@QueryHandler(GetLastPlayedQuery)
export class GetLastPlayedHandler implements IInferredQueryHandler<GetLastPlayedQuery> {
  constructor(private readonly videoRepository: VideoRepository) {}

  @ValidateParams(GetLastPlayedParamSchema)
  public async execute(params: GetLastPlayedQuery): Promise<GetLastPlayedResult> {
    // TODO check permission
    const videos = await this.videoRepository.getLastPlayedVideos(params.userId, params.count);

    return videos.map(VideoCompactDto.create);
  }
}
