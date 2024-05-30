import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type UpdatePlaylistResult = string;

export class UpdatePlaylistCommand extends Command<UpdatePlaylistResult> implements IWithExecutor {
  public readonly playlistId!: string;
  public readonly name!: string;
  public readonly executor!: Executor;

  constructor(params: UpdatePlaylistCommand) {
    super();
    Object.assign(this, params);
  }
}

export const UpdatePlaylistParamSchema = Joi.object<UpdatePlaylistCommand>({
  playlistId: Joi.string().required(),
  name: Joi.string().required().min(1).max(50),
  executor: ExecutorSchema,
}).required();
