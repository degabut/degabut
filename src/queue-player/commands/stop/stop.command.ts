import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class StopCommand extends Command implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: StopCommand) {
    super();
    Object.assign(this, params);
  }
}
export const StopParamSchema = Joi.object<StopCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
