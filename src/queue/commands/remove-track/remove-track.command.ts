import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type RemoveTrackResult = string | null;

export class RemoveTrackCommand extends Command<RemoveTrackResult> {
  userId!: string;
  guildId!: string;
  index?: number;
  trackId?: string;
  isNowPlaying?: boolean;

  constructor(params: RemoveTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const RemoveTrackParamSchema = Joi.object<RemoveTrackCommand>({
  guildId: Joi.string().required(),
  index: Joi.number().min(0).failover(0).allow(0),
  trackId: Joi.string(),
  isNowPlaying: Joi.boolean(),
})
  .required()
  .xor("trackId", "index", "nowPlaying");
