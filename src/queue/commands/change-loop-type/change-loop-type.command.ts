import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { LoopType } from "@queue/entities";
import * as Joi from "joi";

export type ChangeLoopTypeResult = LoopType;

export class ChangeLoopTypeCommand extends Command<ChangeLoopTypeResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly loopType?: LoopType;

  constructor(params: ChangeLoopTypeCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeLoopTypeParamSchema = Joi.object<ChangeLoopTypeCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  loopType: Joi.string().valid(...Object.values(LoopType)),
}).required();
