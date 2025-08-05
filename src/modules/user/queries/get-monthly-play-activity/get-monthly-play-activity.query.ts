import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { UserMonthlyPlayActivityDto } from "@history/dtos";
import { MAX_MONTHLY_ACTIVITY_HISTORY } from "@history/history.constants";
import * as DateExtension from "@joi/date";
import * as BaseJoi from "joi";

const Joi = BaseJoi.extend(DateExtension) as typeof BaseJoi & typeof DateExtension;

export type GetMonthlyPlayActivityResult = UserMonthlyPlayActivityDto[];

export class GetMonthlyPlayActivityQuery
  extends Query<GetMonthlyPlayActivityResult>
  implements IWithExecutor
{
  from!: Date;
  to!: Date;
  userId?: string;
  executor!: Executor;

  constructor(params: GetMonthlyPlayActivityQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetMonthlyPlayActivityParamSchema = Joi.object<GetMonthlyPlayActivityQuery>({
  from: Joi.date().format("YYYY-MM").required(),
  to: Joi.date()
    .format("YYYY-MM")
    .required()
    .greater(Joi.ref("from"))
    .custom((value, helpers) => {
      const from = new Date(helpers.state.ancestors[0].from);
      if (from && value) {
        const diffInMonths = Math.abs(
          value.getMonth() - from.getMonth() + (value.getFullYear() - from.getFullYear()) * 12,
        );
        if (diffInMonths > MAX_MONTHLY_ACTIVITY_HISTORY) return helpers.error("any.invalid");
      }
      return value;
    }, "Date range validation"),
  userId: Joi.string().optional(),
  executor: ExecutorSchema,
})
  .xor("days", "from")
  .and("from", "to")
  .required();
