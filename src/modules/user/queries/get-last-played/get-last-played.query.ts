import { PaginatedQuery } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT, PaginationSchema } from "@common/schemas";
import { MediaSourceDto } from "@media-source/dtos";
import * as Joi from "joi";

export type GetLastPlayedResult = MediaSourceDto[];

export class GetLastPlayedQuery extends PaginatedQuery<GetLastPlayedResult> {
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
  ...PaginationSchema(PAGINATION_DEFAULT_LIMIT),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .required();
