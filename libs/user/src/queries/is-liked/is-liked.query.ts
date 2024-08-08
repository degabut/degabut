import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT } from "@common/schemas";
import * as Joi from "joi";

export type IsLikedResult = boolean[];

export class IsLikedQuery extends Query<IsLikedResult> implements IWithExecutor {
  mediaSourceIds!: string[];
  executor!: Executor;

  constructor(params: IsLikedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const IsLikedParamSchema = Joi.object<IsLikedQuery>({
  mediaSourceIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .max(PAGINATION_DEFAULT_LIMIT)
    .unique()
    .required(),
  executor: ExecutorSchema,
}).required();
