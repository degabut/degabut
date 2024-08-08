import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddNextTrackResult = string;

export class AddNextTrackCommand extends Command<AddNextTrackResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly playNow!: boolean;
  public readonly index?: number;
  public readonly trackId?: string;

  constructor(params: AddNextTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddNextTrackParamSchema = Joi.object<AddNextTrackCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  playNow: Joi.boolean().required(),
  index: Joi.number().min(0).failover(0).allow(0),
  trackId: Joi.string(),
})
  .required()
  .xor("trackId", "index");
