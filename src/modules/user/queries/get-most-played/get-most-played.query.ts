import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT } from "@common/schemas";
import { MAX_HISTORY_DAYS } from "@history/history.constants";
import { MediaSourceDto } from "@media-source/dtos";
import * as Joi from "joi";

export type GetMostPlayedResult = MediaSourceDto[];

export class GetMostPlayedQuery extends Query<GetMostPlayedResult> implements IWithExecutor {
  limit!: number;
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
  limit: Joi.number().required().min(1).max(PAGINATION_DEFAULT_LIMIT),
  days: Joi.number().required().min(1).max(MAX_HISTORY_DAYS),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
