import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class SeekCommand extends Command implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly position!: number;
  public readonly executor!: Executor;

  constructor(params: SeekCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SeekParamSchema = Joi.object<SeekCommand>({
  voiceChannelId: Joi.string().required(),
  position: Joi.number().min(0).required(),
  executor: ExecutorSchema,
}).required();
