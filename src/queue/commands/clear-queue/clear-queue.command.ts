import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class ClearQueueCommand extends Command {
  public readonly removeNowPlaying?: boolean;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: ClearQueueCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ClearQueueParamSchema = Joi.object<ClearQueueCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  removeNowPlaying: Joi.boolean(),
}).required();
