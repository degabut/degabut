import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddPlaylistMediaSourceResult = string;

export class AddPlaylistMediaSourceCommand
  extends Command<AddPlaylistMediaSourceResult>
  implements IWithExecutor
{
  public readonly playlistId!: string;
  public readonly mediaSourceId!: string;
  public readonly executor!: Executor;

  constructor(params: AddPlaylistMediaSourceCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddPlaylistMediaSourceParamSchema = Joi.object<AddPlaylistMediaSourceCommand>({
  playlistId: Joi.string().required(),
  mediaSourceId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
