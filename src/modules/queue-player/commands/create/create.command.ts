import { Command } from "@common/cqrs";
import { Executor } from "@common/interfaces";
import { ExecutorSchema } from "@common/schemas";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import * as Joi from "joi";

export class CreateCommand extends Command {
  public readonly voiceChannel?: BaseGuildVoiceChannel;
  public readonly textChannel?: BaseGuildTextChannel;
  public readonly voiceChannelId?: string;
  public readonly textChannelId?: string;
  public readonly executor!: Executor;

  constructor(params: CreateCommand) {
    super();
    Object.assign(this, params);
  }
}

export const CreateParamSchema = Joi.alternatives(
  Joi.object<CreateCommand>({
    voiceChannel: Joi.object().instance(BaseGuildVoiceChannel).required(),
    textChannel: Joi.object().instance(BaseGuildTextChannel).optional(),
    executor: ExecutorSchema,
  }),
  Joi.object({
    voiceChannelId: Joi.string().required(),
    textChannelId: Joi.string().optional(),
    executor: ExecutorSchema,
  }),
).required();
