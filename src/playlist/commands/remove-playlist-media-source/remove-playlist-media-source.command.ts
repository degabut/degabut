import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemovePlaylistMediaSourceResult = void;

export class RemovePlaylistMediaSourceCommand
  extends Command<RemovePlaylistMediaSourceResult>
  implements IWithExecutor
{
  public readonly playlistId!: string;
  public readonly mediaSourceId!: string;
  public readonly executor!: Executor;

  constructor(params: RemovePlaylistMediaSourceCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemovePlaylistMediaSourceParamSchema = Joi.object<RemovePlaylistMediaSourceCommand>({
  playlistId: Joi.string().required(),
  mediaSourceId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
