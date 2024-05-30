import { ValidateParams } from "@common/decorators";
import { IInferredQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserLikeMediaSourceDto } from "@user/dtos";
import { UserLikeMediaSourceRepository } from "@user/repositories";

import { GetLikedParamSchema, GetLikedQuery, GetLikedResult } from "./get-liked.query";

@QueryHandler(GetLikedQuery)
export class GetLikedHandler implements IInferredQueryHandler<GetLikedQuery> {
  constructor(private readonly repository: UserLikeMediaSourceRepository) {}

  @ValidateParams(GetLikedParamSchema)
  public async execute(params: GetLikedQuery): Promise<GetLikedResult> {
    const { executor, limit, keyword, page } = params;

    const liked = await this.repository.getByUserId(executor.id, { page, limit, keyword });

    return liked.map(UserLikeMediaSourceDto.create);
  }
}
