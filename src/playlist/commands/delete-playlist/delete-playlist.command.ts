import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type DeletePlaylistResult = void;

export class DeletePlaylistCommand extends Command<DeletePlaylistResult> implements IWithExecutor {
  public readonly playlistId!: string;
  public readonly executor!: Executor;

  constructor(params: DeletePlaylistCommand) {
    super();
    Object.assign(this, params);
  }
}

export const DeletePlaylistParamSchema = Joi.object<DeletePlaylistCommand>({
  playlistId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
