import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class RedirectCommand extends Command implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly textChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: RedirectCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RedirectParamSchema = Joi.object<RedirectCommand>({
  voiceChannelId: Joi.string().required(),
  textChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
