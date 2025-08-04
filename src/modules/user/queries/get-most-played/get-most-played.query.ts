import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT } from "@common/schemas";
import { MAX_HISTORY_DAYS } from "@history/history.constants";
import { MediaSourceDto } from "@media-source/dtos";
import * as Joi from "joi";

export type GetMostPlayedResult = MediaSourceDto[];

export class GetMostPlayedQuery extends Query<GetMostPlayedResult> implements IWithExecutor {
  limit!: number;
  days?: number;
  from?: Date;
  to?: Date;
  excludeFrom?: Date;
  excludeTo?: Date;
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
  days: Joi.number().optional().min(1).max(MAX_HISTORY_DAYS),
  from: Joi.date().optional(),
  to: Joi.date()
    .optional()
    .greater(Joi.ref("from"))
    .custom((value, helpers) => {
      const from = helpers.state.ancestors[0].from;
      if (from && value) {
        const diffInDays = (value.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > MAX_HISTORY_DAYS) return helpers.error("any.invalid");
      }
      return value;
    }, "Date range validation"),
  excludeFrom: Joi.date().optional(),
  excludeTo: Joi.date()
    .optional()
    .greater(Joi.ref("excludeFrom"))
    .custom((value, helpers) => {
      const from = helpers.state.ancestors[0].excludeFrom;
      if (from && value) {
        const diffInDays = (value.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
        if (diffInDays > MAX_HISTORY_DAYS) return helpers.error("any.invalid");
      }
      return value;
    }, "Date range validation"),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .xor("days", "from")
  .with("from", "to")
  .with("excludeFrom", "excludeTo")
  .required();
