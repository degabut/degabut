import { Query } from "@common/cqrs";
import { QueueDto } from "@queue/dtos";
import * as Joi from "joi";

export type GetQueueResult = QueueDto | null;

export class GetQueueQuery extends Query<GetQueueResult> {
  guildId!: string;

  constructor(params: GetQueueQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueueParamSchema = Joi.object<GetQueueQuery>({
  guildId: Joi.string().required(),
}).required();
