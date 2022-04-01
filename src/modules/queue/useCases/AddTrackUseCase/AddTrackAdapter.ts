import { UseCaseAdapter } from "core/UseCaseAdapter";
import { BaseGuildTextChannel, BaseGuildVoiceChannel } from "discord.js";
import Joi from "joi";

export type AddTrackParams = {
	keyword: string;
	id: string;
	guildId: string;
	voiceChannel?: BaseGuildVoiceChannel;
	textChannel?: BaseGuildTextChannel;
};

export class AddTrackAdapter extends UseCaseAdapter<AddTrackParams> {
	constructor(params: Partial<AddTrackParams>) {
		super(params);
	}

	static SCHEMA = Joi.object<AddTrackParams>({
		keyword: Joi.string(),
		id: Joi.string(),
		guildId: Joi.string().required(),
		voiceChannel: Joi.object().instance(BaseGuildVoiceChannel),
		textChannel: Joi.object().instance(BaseGuildTextChannel),
	})
		.required()
		.xor("keyword", "id");
}
