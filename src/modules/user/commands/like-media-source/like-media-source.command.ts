import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type LikeMediaSourceResult = void;

export class LikeMediaSourceCommand
  extends Command<LikeMediaSourceResult>
  implements IWithExecutor
{
  public readonly mediaSourceId!: string;
  public readonly executor!: Executor;

  constructor(params: LikeMediaSourceCommand) {
    super();
    Object.assign(this, params);
  }
}

export const LikeMediaSourceParamSchema = Joi.object<LikeMediaSourceCommand>({
  mediaSourceId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
