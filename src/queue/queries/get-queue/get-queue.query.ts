import { Query } from "@common/cqrs";
import { QueueDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetQueueResult = QueueDto | null;

export class GetQueueQuery extends Query<GetQueueResult> {
  voiceChannelId!: string;

  constructor(params: GetQueueQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueueParamSchema = Joi.object<GetQueueQuery>({
  voiceChannelId: Joi.string().required(),
}).required();
