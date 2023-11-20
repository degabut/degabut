import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserLikeVideoRepository } from "@user/repositories";

import {
  IsVideosLikedParamSchema,
  IsVideosLikedQuery,
  IsVideosLikedResult,
} from "./is-videos-liked.query";

@QueryHandler(IsVideosLikedQuery)
export class IsVideosLikedHandler implements IInferredQueryHandler<IsVideosLikedQuery> {
  constructor(private readonly repository: UserLikeVideoRepository) {}

  @ValidateParams(IsVideosLikedParamSchema)
  public async execute(params: IsVideosLikedQuery): Promise<IsVideosLikedResult> {
    const { executor, videoIds } = params;
    const isLiked = await this.repository.isVideosLiked(executor.id, videoIds);
    return isLiked;
  }
}
