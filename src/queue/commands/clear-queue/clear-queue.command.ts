import { Command } from "@common/cqrs";
import * as Joi from "joi";

export class ClearQueueCommand extends Command {
  removeNowPlaying?: boolean;
  voiceChannelId!: string;

  constructor(params: ClearQueueCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ClearQueueParamSchema = Joi.object<ClearQueueCommand>({
  voiceChannelId: Joi.string().required(),
  removeNowPlaying: Joi.boolean(),
}).required();
