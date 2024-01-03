import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type AddTrackResult = string;

export class AddTrackCommand extends Command<AddTrackResult> implements IWithExecutor {
  public readonly youtubeKeyword?: string;
  public readonly mediaSourceId?: string;
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;

  constructor(params: AddTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTrackParamSchema = Joi.object<AddTrackCommand>({
  youtubeKeyword: Joi.string(),
  mediaSourceId: Joi.string(),
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
})
  .required()
  .xor("youtubeKeyword", "mediaSourceId");
