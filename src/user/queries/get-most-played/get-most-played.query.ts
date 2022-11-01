import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { VideoCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetMostPlayedResult = VideoCompactDto[];

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
  count: Joi.number().required(),
  days: Joi.number().required(),
  userId: Joi.string().required(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
