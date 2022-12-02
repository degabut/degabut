import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class SkipCommand extends Command implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: SkipCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SkipParamSchema = Joi.object<SkipCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
