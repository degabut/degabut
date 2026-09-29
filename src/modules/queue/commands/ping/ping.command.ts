import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class PingCommand extends Command {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: PingCommand) {
    super();
    Object.assign(this, params);
  }
}

export const PingParamSchema = Joi.object({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
