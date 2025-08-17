import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { QueueAutoplayOptions } from "@queue/entities";
import * as Joi from "joi";

export type ChangeAutoplayOptionsResult = QueueAutoplayOptions;

export class ChangeAutoplayOptionsCommand
  extends Command<QueueAutoplayOptions>
  implements QueueAutoplayOptions
{
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly includeQueueLastPlayedRelated!: boolean;
  public readonly includeQueueRelated!: boolean;
  public readonly includeUserLibrary!: boolean;
  public readonly minDuration!: number;
  public readonly maxDuration!: number;

  constructor(params: ChangeAutoplayOptionsCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeAutoplayOptionsParamSchema = Joi.object<ChangeAutoplayOptionsCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  includeQueueLastPlayedRelated: Joi.boolean().required(),
  includeQueueRelated: Joi.boolean().required(),
  includeUserLibrary: Joi.boolean().required(),
  minDuration: Joi.number().min(0).required(),
  maxDuration: Joi.number().min(0).required().greater(Joi.ref("minDuration")),
}).required();
