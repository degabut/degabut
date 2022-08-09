import { Command } from "@common/cqrs";
import { GuildMember } from "discord.js";
import * as Joi from "joi";

export class SkipCommand extends Command {
  public readonly voiceChannelId!: string;
  public readonly member!: GuildMember;

  constructor(params: SkipCommand) {
    super();
    Object.assign(this, params);
  }
}
export const SkipParamSchema = Joi.object<SkipCommand>({
  voiceChannelId: Joi.string().required(),
  member: Joi.object().instance(GuildMember).required(),
}).required();
