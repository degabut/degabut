import { PaginatedQuery } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT, PaginationSchema } from "@common/schemas";
import { UserLikeMediaSourceDto } from "@user/dtos";
import * as Joi from "joi";

export type GetLikedResult = UserLikeMediaSourceDto[];

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
  ...PaginationSchema(PAGINATION_DEFAULT_LIMIT),
  keyword: Joi.string().optional(),
}).required();
