import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { QueueDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetQueueSResult = QueueDto[];

export class GetQueuesQuery extends Query<GetQueueSResult> implements IWithExecutor {
  readonly executor!: Executor;

  constructor(params: GetQueuesQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueuesParamSchema = Joi.object<GetQueuesQuery>({
  executor: ExecutorSchema,
}).required();
