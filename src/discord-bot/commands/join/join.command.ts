import { Command } from "@common/cqrs";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import * as Joi from "joi";

export class JoinCommand extends Command {
  readonly voiceChannel!: BaseGuildVoiceChannel;
  readonly textChannel!: BaseGuildTextChannel;

  constructor(params: JoinCommand) {
    super();
    Object.assign(this, params);
  }
}
export const JoinParamSchema = Joi.object<JoinCommand>({
  voiceChannel: Joi.object().instance(BaseGuildVoiceChannel).required(),
  textChannel: Joi.object().instance(BaseGuildTextChannel).required(),
}).required();
