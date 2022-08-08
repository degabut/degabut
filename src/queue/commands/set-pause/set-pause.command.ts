import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type SetPauseResult = boolean;

export class SetPauseCommand extends Command<SetPauseResult> {
  voiceChannelId!: string;
  isPaused!: boolean;

  constructor(params: SetPauseCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SetPauseParamSchema = Joi.object<SetPauseCommand>({
  voiceChannelId: Joi.string().required(),
  isPaused: Joi.boolean().required(),
}).required();
