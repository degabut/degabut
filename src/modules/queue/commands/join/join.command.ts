import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class JoinCommand extends Command {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: JoinCommand) {
    super();
    Object.assign(this, params);
  }
}

export const JoinParamSchema = Joi.object({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
