import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class LeaveCommand extends Command {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: LeaveCommand) {
    super();
    Object.assign(this, params);
  }
}

export const LeaveParamSchema = Joi.object({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
