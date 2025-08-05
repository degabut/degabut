import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema, PAGINATION_DEFAULT_LIMIT } from "@common/schemas";
import { MAX_HISTORY_DAYS } from "@history/history.constants";
import * as DateExtension from "@joi/date";
import { MediaSourceDto } from "@media-source/dtos";
import * as BaseJoi from "joi";

const Joi = BaseJoi.extend(DateExtension) as typeof BaseJoi & typeof DateExtension;

export type GetMostPlayedResult = MediaSourceDto[];

export class GetMostPlayedQuery extends Query<GetMostPlayedResult> implements IWithExecutor {
  limit!: number;
  days?: number;
  from?: Date;
  to?: Date;
  excludeFrom?: Date;
  excludeTo?: Date;
  excludeLimit?: number;
  excludeTopPercent?: number;
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
  from: Joi.date().format("YYYY-MM-DD").optional(),
  to: Joi.date()
    .optional()
    .format("YYYY-MM-DD")
    .greater(Joi.ref("from"))
    .custom((value, helpers) => {
      return rangeValidation(value, helpers, "from", MAX_HISTORY_DAYS);
    }, "Date range validation"),
  excludeFrom: Joi.date().format("YYYY-MM-DD").optional(),
  excludeTo: Joi.date()
    .optional()
    .format("YYYY-MM-DD")
    .greater(Joi.ref("excludeFrom"))
    .custom(
      (value, helpers) => rangeValidation(value, helpers, "excludeFrom", MAX_HISTORY_DAYS),
      "Date range validation",
    ),
  excludeLimit: Joi.number().optional().min(1).max(PAGINATION_DEFAULT_LIMIT),
  excludeTopPercent: Joi.number().optional().greater(0).max(1),
  userId: Joi.string().optional(),
  voiceChannel: Joi.valid(true).optional(),
  guild: Joi.valid(true).optional(),
  executor: ExecutorSchema,
})
  .xor("userId", "voiceChannel", "guild")
  .xor("days", "from")
  .and("from", "to")
  .and("excludeFrom", "excludeTo")
  .with("excludeTopPercent", "excludeFrom")
  .with("excludeLimit", "excludeFrom")
  .required();

const rangeValidation = (
  value: Date,
  helpers: BaseJoi.CustomHelpers,
  targetKey: string,
  days: number,
) => {
  const target = new Date(helpers.state.ancestors[0][targetKey]);
  if (target && value) {
    const diffInDays = Math.abs((value.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays > days) return helpers.error("any.invalid");
  }
  return value;
};
