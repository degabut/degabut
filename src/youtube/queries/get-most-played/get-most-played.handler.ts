import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VideoCompactDto } from "@youtube/dtos";
import { VideoRepository } from "@youtube/repositories";

import {
  GetMostPlayedParamSchema,
  GetMostPlayedQuery,
  GetMostPlayedResult,
} from "./get-most-played.query";

@QueryHandler(GetMostPlayedQuery)
export class GetMostPlayedHandler implements IInferredQueryHandler<GetMostPlayedQuery> {
  constructor(private readonly videoRepository: VideoRepository) {}

  @ValidateParams(GetMostPlayedParamSchema)
  public async execute(params: GetMostPlayedQuery): Promise<GetMostPlayedResult> {
    // TODO check permission
    const from = new Date();
    from.setDate(from.getDate() - params.days);

    const videos = await this.videoRepository.getMostPlayedVideos(params.userId, {
      count: params.count,
      from,
    });

    return videos.map(VideoCompactDto.create);
  }
}
