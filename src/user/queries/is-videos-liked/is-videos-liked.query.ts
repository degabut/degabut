import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type IsVideosLikedResult = boolean[];

export class IsVideosLikedQuery extends Query<IsVideosLikedResult> implements IWithExecutor {
  videoIds!: string[];
  executor!: Executor;

  constructor(params: IsVideosLikedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const IsVideosLikedParamSchema = Joi.object<IsVideosLikedQuery>({
  videoIds: Joi.array().items(Joi.string().required()).min(1).max(50).unique().required(),
  executor: ExecutorSchema,
}).required();
