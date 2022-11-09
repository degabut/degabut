import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddTracksResult = string[];

export class AddTracksCommand extends Command<AddTracksResult> implements IWithExecutor {
  public readonly playlistId!: string;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: AddTracksCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTracksParamSchema = Joi.object<AddTracksCommand>({
  playlistId: Joi.string().required(),
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
}).required();
