import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class PlayTrackCommand extends Command<string> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly index?: number;
  public readonly trackId?: string;

  constructor(params: PlayTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const PlayTrackParamSchema = Joi.object<PlayTrackCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  index: Joi.number().min(0).failover(0).allow(0),
  trackId: Joi.string(),
})
  .required()
  .xor("trackId", "index");
