import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type ToggleAutoplayResult = boolean;

export class ToggleAutoplayCommand extends Command<ToggleAutoplayResult> {
  guildId!: string;

  constructor(params: ToggleAutoplayCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleAutoplayParamSchema = Joi.object<ToggleAutoplayCommand>({
  guildId: Joi.string().required(),
}).required();
