import { Query } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { QueuePlayerDto } from "@queue-player/dtos";
import * as Joi from "joi";

export type GetQueuePlayerResult = QueuePlayerDto;

export class GetQueuePlayerQuery extends Query<GetQueuePlayerResult> implements IWithExecutor {
  readonly voiceChannelId!: string;
  readonly executor!: Executor;

  constructor(params: GetQueuePlayerQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueuePlayerParamSchema = Joi.object<GetQueuePlayerQuery>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
