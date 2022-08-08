import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type ToggleAutoplayResult = boolean;

export class ToggleAutoplayCommand extends Command<ToggleAutoplayResult> {
  voiceChannelId!: string;

  constructor(params: ToggleAutoplayCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleAutoplayParamSchema = Joi.object<ToggleAutoplayCommand>({
  voiceChannelId: Joi.string().required(),
}).required();
