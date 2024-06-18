import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemoveNextTrackResult = string | null;

export class RemoveNextTrackCommand
  extends Command<RemoveNextTrackResult>
  implements IWithExecutor
{
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly trackId!: string;

  constructor(params: RemoveNextTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemoveNextTrackParamSchema = Joi.object<RemoveNextTrackCommand>({
  voiceChannelId: Joi.string().required(),
  trackId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
