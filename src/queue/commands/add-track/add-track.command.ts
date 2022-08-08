import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type AddTrackResult = string;

export class AddTrackCommand extends Command<AddTrackResult> {
  public readonly keyword?: string;
  public readonly videoId?: string;
  public readonly requestedBy!: string;
  public readonly voiceChannelId!: string;

  constructor(params: AddTrackCommand) {
    super();
    Object.assign(this, params);
  }
}

export const AddTrackParamSchema = Joi.object<AddTrackCommand>({
  keyword: Joi.string(),
  videoId: Joi.string(),
  voiceChannelId: Joi.string().required(),
  requestedBy: Joi.string().required(),
})
  .required()
  .xor("keyword", "videoId");
