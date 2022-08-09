import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddTrackResult = string;

export class AddTrackCommand extends Command<AddTrackResult> implements IWithExecutor {
  public readonly keyword?: string;
  public readonly videoId?: string;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: AddTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTrackParamSchema = Joi.object<AddTrackCommand>({
  keyword: Joi.string(),
  videoId: Joi.string(),
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
})
  .required()
  .xor("keyword", "videoId");
