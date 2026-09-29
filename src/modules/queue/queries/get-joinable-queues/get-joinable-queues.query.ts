import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { QueueSummaryDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetJoinableQueuesResult = QueueSummaryDto[];

export class GetJoinableQueuesQuery
  extends Query<GetJoinableQueuesResult>
  implements IWithExecutor
{
  readonly executor!: Executor;

  constructor(params: GetJoinableQueuesQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetJoinableQueuesParamSchema = Joi.object<GetJoinableQueuesQuery>({
  executor: ExecutorSchema,
}).required();
