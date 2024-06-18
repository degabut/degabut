import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type UnlikeMediaSourceResult = void;

export class UnlikeMediaSourceCommand
  extends Command<UnlikeMediaSourceResult>
  implements IWithExecutor
{
  public readonly mediaSourceId!: string;
  public readonly executor!: Executor;

  constructor(params: UnlikeMediaSourceCommand) {
    super();
    Object.assign(this, params);
  }
}

export const UnlikeMediaSourceParamSchema = Joi.object<UnlikeMediaSourceCommand>({
  mediaSourceId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
