import { ValidateParams } from "@common/decorators";
import { PaginatedQueryParser } from "@common/utils";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserLikeMediaSourceDto } from "@user/dtos";
import { UserLikeMediaSource } from "@user/entities";
import { IGetByUserIdPagination, UserLikeMediaSourceRepository } from "@user/repositories";

import { GetLikedParamSchema, GetLikedQuery, GetLikedResult } from "./get-liked.query";

@QueryHandler(GetLikedQuery)
export class GetLikedHandler implements IInferredQueryHandler<GetLikedQuery> {
  private readonly paginationParser = new PaginatedQueryParser<
    UserLikeMediaSource,
    IGetByUserIdPagination
  >((d) => ({
    mediaSourceId: d.mediaSourceId,
    likedAt: d.likedAt.toISOString(),
  }));

  constructor(private readonly repository: UserLikeMediaSourceRepository) {}

  @ValidateParams(GetLikedParamSchema)
  public async execute(params: GetLikedQuery): Promise<GetLikedResult> {
    const { executor, limit, keyword } = params;
    const next = this.paginationParser.decode(params.nextToken);

    const liked = await this.repository.getByUserId(executor.id, { next, limit }, keyword);

    return {
      nextToken: this.paginationParser.encode(liked, limit),
      data: liked.map(UserLikeMediaSourceDto.create),
    };
  }
}
