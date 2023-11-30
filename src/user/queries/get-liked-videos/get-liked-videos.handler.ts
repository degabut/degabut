import { ValidateParams } from "@common/decorators";
import { PaginatedQueryParser } from "@common/utils";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserLikeVideoDto } from "@user/dtos";
import { UserLikeVideo } from "@user/entities";
import { IGetByUserIdPagination, UserLikeVideoRepository } from "@user/repositories";

import {
  GetLikedVideosParamSchema,
  GetLikedVideosQuery,
  GetLikedVideosResult,
} from "./get-liked-videos.query";

@QueryHandler(GetLikedVideosQuery)
export class GetLikedVideosHandler implements IInferredQueryHandler<GetLikedVideosQuery> {
  private readonly paginationParser = new PaginatedQueryParser<
    UserLikeVideo,
    IGetByUserIdPagination
  >((d) => ({
    videoId: d.videoId,
    likedAt: d.likedAt.toISOString(),
  }));

  constructor(private readonly repository: UserLikeVideoRepository) {}

  @ValidateParams(GetLikedVideosParamSchema)
  public async execute(params: GetLikedVideosQuery): Promise<GetLikedVideosResult> {
    const { executor, limit, keyword } = params;
    const next = this.paginationParser.decode(params.nextToken);

    const likedVideos = await this.repository.getByUserId(executor.id, { next, limit }, keyword);

    return {
      nextToken: this.paginationParser.encode(likedVideos, limit),
      data: likedVideos.map(UserLikeVideoDto.create),
    };
  }
}
