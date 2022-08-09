import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemoveTrackResult = string | null;

export class RemoveTrackCommand extends Command<RemoveTrackResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly index?: number;
  public readonly trackId?: string;
  public readonly isNowPlaying?: boolean;

  constructor(params: RemoveTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemoveTrackParamSchema = Joi.object<RemoveTrackCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  index: Joi.number().min(0).failover(0).allow(0),
  trackId: Joi.string(),
  isNowPlaying: Joi.boolean(),
})
  .required()
  .xor("trackId", "index", "nowPlaying");
