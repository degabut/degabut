import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class JamCommand extends Command {
  public readonly count!: number;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: JamCommand) {
    super();
    Object.assign(this, params);
  }
}

export const JamParamSchema = Joi.object<JamCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  count: Joi.number().min(1).max(5).required(),
}).required();
