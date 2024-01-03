import { IPaginatedResult, PaginatedQuery } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PaginationSchema } from "@common/schemas";
import { UserLikeMediaSourceDto } from "@user/dtos";
import * as Joi from "joi";

export type GetLikedResult = IPaginatedResult<UserLikeMediaSourceDto>;

export class GetLikedQuery extends PaginatedQuery<GetLikedResult> implements IWithExecutor {
  executor!: Executor;
  keyword?: string;

  constructor(params: GetLikedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetLikedParamSchema = Joi.object<GetLikedQuery>({
  executor: ExecutorSchema,
  ...PaginationSchema(50, 50),
  keyword: Joi.string().optional(),
}).required();
