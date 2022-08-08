import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type ToggleShuffleResult = boolean;

export class ToggleShuffleCommand extends Command<ToggleShuffleResult> {
  voiceChannelId!: string;

  constructor(params: ToggleShuffleCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleShuffleParamSchema = Joi.object<ToggleShuffleCommand>({
  voiceChannelId: Joi.string().required(),
}).required();
