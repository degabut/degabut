import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserLikeMediaSourceRepository } from "@user/repositories";

import { IsLikedParamSchema, IsLikedQuery, IsLikedResult } from "./is-liked.query";

@QueryHandler(IsLikedQuery)
export class IsLikedHandler implements IInferredQueryHandler<IsLikedQuery> {
  constructor(private readonly repository: UserLikeMediaSourceRepository) {}

  @ValidateParams(IsLikedParamSchema)
  public async execute(params: IsLikedQuery): Promise<IsLikedResult> {
    const { executor, mediaSourceIds } = params;
    const isLiked = await this.repository.isLiked(executor.id, mediaSourceIds);
    return isLiked;
  }
}
