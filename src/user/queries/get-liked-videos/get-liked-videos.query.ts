import { IPaginatedResult, PaginatedQuery } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PaginationSchema } from "@common/schemas";
import { UserLikeVideoDto } from "@user/dto/user-like-video.dto";
import * as Joi from "joi";

export type GetLikedVideosResult = IPaginatedResult<UserLikeVideoDto>;

export class GetLikedVideosQuery
  extends PaginatedQuery<GetLikedVideosResult>
  implements IWithExecutor
{
  executor!: Executor;

  constructor(params: GetLikedVideosQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetLikedVideosParamSchema = Joi.object<GetLikedVideosQuery>({
  executor: ExecutorSchema,
  ...PaginationSchema(50, 50),
}).required();
