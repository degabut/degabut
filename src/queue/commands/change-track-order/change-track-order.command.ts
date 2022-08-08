import { Command } from "@common/cqrs";
import * as Joi from "joi";

export class ChangeTrackOrderCommand extends Command {
  voiceChannelId!: string;
  trackId?: string;
  from?: number;
  to!: number;

  constructor(params: ChangeTrackOrderCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ChangeTrackOrderParamSchema = Joi.object<ChangeTrackOrderCommand>({
  voiceChannelId: Joi.string().required(),
  trackId: Joi.string(),
  from: Joi.number().min(0),
  to: Joi.number().required().min(0),
})
  .required()
  .xor("trackId", "from");
