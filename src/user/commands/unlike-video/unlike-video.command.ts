import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type UnlikeVideoResult = void;

export class UnlikeVideoCommand extends Command<UnlikeVideoResult> implements IWithExecutor {
  public readonly videoId!: string;
  public readonly executor!: Executor;

  constructor(params: UnlikeVideoCommand) {
    super();
    Object.assign(this, params);
  }
}

export const UnlikeVideoParamSchema = Joi.object<UnlikeVideoCommand>({
  videoId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
