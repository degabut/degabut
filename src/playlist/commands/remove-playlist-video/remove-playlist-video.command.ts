import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemovePlaylistVideoResult = void;

export class RemovePlaylistVideoCommand
  extends Command<RemovePlaylistVideoResult>
  implements IWithExecutor
{
  public readonly playlistId!: string;
  public readonly playlistVideoId!: string;
  public readonly executor!: Executor;

  constructor(params: RemovePlaylistVideoCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemovePlaylistVideoParamSchema = Joi.object<RemovePlaylistVideoCommand>({
  playlistId: Joi.string().required(),
  playlistVideoId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
