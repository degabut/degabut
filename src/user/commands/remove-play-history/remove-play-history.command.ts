import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemovePlayHistoryResult = void;

export class RemovePlayHistoryCommand
  extends Command<RemovePlayHistoryResult>
  implements IWithExecutor
{
  public readonly videoId!: string;
  public readonly executor!: Executor;

  constructor(params: RemovePlayHistoryCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemovePlayHistoryParamSchema = Joi.object<RemovePlayHistoryCommand>({
  videoId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
