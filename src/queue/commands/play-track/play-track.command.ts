import { Command } from "@common/cqrs";
import * as Joi from "joi";

export class PlayTrackCommand extends Command<string> {
  guildId!: string;
  index!: number;
  trackId!: string;

  constructor(params: PlayTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const PlayTrackParamSchema = Joi.object<PlayTrackCommand>({
  guildId: Joi.string().required(),
  index: Joi.number().min(0).failover(0).allow(0),
  trackId: Joi.string(),
})
  .required()
  .xor("trackId", "index");
