import { Query } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { VideoCompactDto } from "@youtube/dtos";
import * as Joi from "joi";

export type GetLastPlayedResult = VideoCompactDto[];

export class GetLastPlayedQuery extends Query<GetLastPlayedResult> {
  count!: number;
  userId?: string;
  voiceChannel?: true;
  guild?: true;
  executor!: Executor;

  constructor(params: GetLastPlayedQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetLastPlayedParamSchema = Joi.object<GetLastPlayedQuery>({
  count: Joi.number().required(),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
