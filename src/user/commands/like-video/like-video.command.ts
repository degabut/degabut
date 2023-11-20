import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type LikeVideoResult = void;

export class LikeVideoCommand extends Command<LikeVideoResult> implements IWithExecutor {
  public readonly videoId!: string;
  public readonly executor!: Executor;

  constructor(params: LikeVideoCommand) {
    super();
    Object.assign(this, params);
  }
}

export const LikeVideoParamSchema = Joi.object<LikeVideoCommand>({
  videoId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
