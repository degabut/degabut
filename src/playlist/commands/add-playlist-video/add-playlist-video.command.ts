import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddPlaylistVideoResult = string;

export class AddPlaylistVideoCommand
  extends Command<AddPlaylistVideoResult>
  implements IWithExecutor
{
  public readonly playlistId!: string;
  public readonly videoId!: string;
  public readonly executor!: Executor;

  constructor(params: AddPlaylistVideoCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddPlaylistVideoParamSchema = Joi.object<AddPlaylistVideoCommand>({
  playlistId: Joi.string().required(),
  videoId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
