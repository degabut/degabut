import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { MediaSourceDto } from "@media-source/dtos";
import * as Joi from "joi";

export type GetMostPlayedResult = MediaSourceDto[];

export class GetMostPlayedQuery extends Query<GetMostPlayedResult> implements IWithExecutor {
  count!: number;
  days!: number;
  userId?: string;
  voiceChannel?: true;
  guild?: true;
  executor!: Executor;

  constructor(params: GetMostPlayedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetMostPlayedParamSchema = Joi.object<GetMostPlayedQuery>({
  count: Joi.number().required().min(1).max(100),
  days: Joi.number().required().min(1).max(365),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
