import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type ToggleShuffleResult = boolean;

export class ToggleShuffleCommand extends Command<ToggleShuffleResult> {
  guildId!: string;

  constructor(params: ToggleShuffleCommand) {
    super();
    Object.assign(this, params);
  }
}

export const ToggleShuffleParamSchema = Joi.object<ToggleShuffleCommand>({
  guildId: Joi.string().required(),
}).required();
