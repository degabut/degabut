import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type ToggleAutoplayResult = boolean;

export class ToggleAutoplayCommand extends Command<ToggleAutoplayResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: ToggleAutoplayCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleAutoplayParamSchema = Joi.object<ToggleAutoplayCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
