import { Query } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { MediaSourceDto } from "@media-source/dtos";
import * as Joi from "joi";

export type GetLastPlayedResult = MediaSourceDto[];

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
  count: Joi.number().required().min(1).max(100),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
