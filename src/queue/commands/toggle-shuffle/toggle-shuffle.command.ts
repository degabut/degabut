import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type ToggleShuffleResult = boolean;

export class ToggleShuffleCommand extends Command<ToggleShuffleResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: ToggleShuffleCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleShuffleParamSchema = Joi.object<ToggleShuffleCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
