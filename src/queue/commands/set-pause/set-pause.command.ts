import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type SetPauseResult = boolean;

export class SetPauseCommand extends Command<SetPauseResult> {
  guildId!: string;
  isPaused!: boolean;

  constructor(params: SetPauseCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SetPauseParamSchema = Joi.object<SetPauseCommand>({
  guildId: Joi.string().required(),
  isPaused: Joi.boolean().required(),
}).required();
