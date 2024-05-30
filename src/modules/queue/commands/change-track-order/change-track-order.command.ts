import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import * as Joi from "joi";

export class ChangeTrackOrderCommand extends Command {
  public readonly voiceChannelId!: string;
  public readonly executor!: Executor;
  public readonly trackId?: string;
  public readonly from?: number;
  public readonly to!: number;

  constructor(params: ChangeTrackOrderCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeTrackOrderParamSchema = Joi.object<ChangeTrackOrderCommand>({
  voiceChannelId: Joi.string().required(),
  executor: ExecutorSchema,
  trackId: Joi.string(),
  from: Joi.number().min(0),
  to: Joi.number().required().min(0),
})
  .required()
  .xor("trackId", "from");
