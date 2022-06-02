import { UseCaseAdapter } from "@core";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import Joi from "joi";

export type JoinParams = {
	voiceChannel: BaseGuildVoiceChannel;
	textChannel: BaseGuildTextChannel;
};

export class JoinAdapter extends UseCaseAdapter<JoinParams> {
	constructor(params: Partial<JoinParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<JoinParams>({
		voiceChannel: Joi.object().instance(BaseGuildVoiceChannel).required(),
		textChannel: Joi.object().instance(BaseGuildTextChannel).required(),
	}).required();
}
