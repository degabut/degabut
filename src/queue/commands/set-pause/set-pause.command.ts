import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type SetPauseResult = boolean;

export class SetPauseCommand extends Command<SetPauseResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly isPaused!: boolean;

  constructor(params: SetPauseCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SetPauseParamSchema = Joi.object<SetPauseCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  isPaused: Joi.boolean().required(),
}).required();
