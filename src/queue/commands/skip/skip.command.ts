import { Command } from "@common/cqrs";
import * as Joi from "joi";

export type SkipResult = string | null;

export class SkipCommand extends Command<SkipResult> {
  userId!: string;
  guildId!: string;

  constructor(params: SkipCommand) {
    super();
    Object.assign(this, params);
  }
}

export const SkipParamSchema = Joi.object<SkipCommand>({
  userId: Joi.string().required(),
  guildId: Joi.string().required(),
}).required();
