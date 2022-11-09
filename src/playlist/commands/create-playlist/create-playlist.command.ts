import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type CreatePlaylistResult = string;

export class CreatePlaylistCommand extends Command<CreatePlaylistResult> implements IWithExecutor {
  public readonly name!: string;
  public readonly executor!: Executor;

  constructor(params: CreatePlaylistCommand) {
    super();
    Object.assign(this, params);
  }
}

export const CreatePlaylistParamSchema = Joi.object<CreatePlaylistCommand>({
  name: Joi.string().required().min(1).max(50),
  executor: ExecutorSchema,
}).required();
