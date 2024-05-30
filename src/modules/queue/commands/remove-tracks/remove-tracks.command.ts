import { Command } from "@common/cqrs";
import { Executor, IWithExecutor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export type RemoveTracksResult = string[];

export class RemoveTracksCommand extends Command<RemoveTracksResult> implements IWithExecutor {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly trackIds?: string[];
  public readonly memberId?: string;

  constructor(params: RemoveTracksCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemoveTracksParamSchema = Joi.object<RemoveTracksCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  trackIds: Joi.array().items(Joi.string()),
  memberId: Joi.string(),
})
  .required()
  .xor("trackIds", "memberId");
