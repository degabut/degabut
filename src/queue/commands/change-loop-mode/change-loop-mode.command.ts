import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { LoopMode } from "@queue/entities";
import * as Joi from "joi";

export type ChangeLoopModeResult = LoopMode;

export class ChangeLoopModeCommand extends Command<ChangeLoopModeResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly loopMode?: LoopMode;

  constructor(params: ChangeLoopModeCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeLoopModeParamSchema = Joi.object<ChangeLoopModeCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  loopMode: Joi.string().valid(...Object.values(LoopMode)),
}).required();
