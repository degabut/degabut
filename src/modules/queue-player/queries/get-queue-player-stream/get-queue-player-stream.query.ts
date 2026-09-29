import { Query } from "@common/cqrs";
import { PlayerStream } from "@queue-player/providers";
import * as Joi from "joi";

export type GetQueuePlayerStreamResult = PlayerStream;

export class GetQueuePlayerStreamQuery extends Query<GetQueuePlayerStreamResult> {
  readonly voiceChannelId!: string;
  readonly token!: string;

  constructor(params: GetQueuePlayerStreamQuery) {
    super();
    Object.assign(this, params);
  }
}

export const GetQueuePlayerStreamParamSchema = Joi.object<GetQueuePlayerStreamQuery>({
  voiceChannelId: Joi.string().required(),
  token: Joi.string().required(),
}).required();
